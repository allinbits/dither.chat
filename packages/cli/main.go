package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"sync"

	cosmoscodec "github.com/cosmos/cosmos-sdk/codec"
	codectypes "github.com/cosmos/cosmos-sdk/codec/types"
	cryptocodec "github.com/cosmos/cosmos-sdk/crypto/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/tx"
	banktypes "github.com/cosmos/cosmos-sdk/x/bank/types"

	"github.com/cometbft/cometbft/rpc/client/http"
	cftypes "github.com/cometbft/cometbft/types"
)

const maxConcurrentBlocks = 25

type Config struct {
	RPCEndpoint string `json:"rpc_endpoint"`
}

type TransactionResult struct {
	Height    int64
	TxHash    string
	Memo      string
	Recipient string
	Amount    string
}

func main() {
	config, err := loadConfig("config.json")
	if err != nil {
		fmt.Printf("Error loading configuration: %v\n", err)
		os.Exit(1)
	}

	client, err := http.New(config.RPCEndpoint, "/websocket")
	if err != nil {
		fmt.Printf("Failed to create RPC client: %v\n", err)
		os.Exit(1)
	}

	status, err := client.Status(context.Background())
	if err != nil {
		fmt.Printf("Failed to connect to RPC endpoint %s: %v\n", config.RPCEndpoint, err)
		os.Exit(1)
	}

	fmt.Printf("Connected to RPC endpoint: %s (Chain ID: %s)\n", config.RPCEndpoint, status.NodeInfo.Network)

	latestBlock, err := client.Block(context.Background(), nil)
	if err != nil {
		fmt.Printf("Failed to get latest block: %v\n", err)
		os.Exit(1)
	}
	headBlockHeight := latestBlock.Block.Height
	fmt.Printf("Latest block height: %d\n", headBlockHeight)

	startBlockHeight := headBlockHeight - 100
	if startBlockHeight < 1 {
		startBlockHeight = 1
	}
	fmt.Printf("Starting scan from block height: %d\n", startBlockHeight)

	interfaceRegistry := codectypes.NewInterfaceRegistry()
	banktypes.RegisterInterfaces(interfaceRegistry)
	cryptocodec.RegisterInterfaces(interfaceRegistry)

	cdc := cosmoscodec.NewProtoCodec(interfaceRegistry)

	var wg sync.WaitGroup
	var mu sync.Mutex

	blockProcessingLimiter := make(chan struct{}, maxConcurrentBlocks)

	foundTransactions := []TransactionResult{}

	for currentBlockHeight := startBlockHeight; currentBlockHeight <= headBlockHeight; currentBlockHeight++ {
		blockProcessingLimiter <- struct{}{} // Acquire a slot
		wg.Add(1)

		go func(blockHeight int64) {
			defer wg.Done()
			defer func() { <-blockProcessingLimiter }() // Release the slot when done

			fmt.Printf("Processing block: %d\n", blockHeight)
			block, err := client.Block(context.Background(), &blockHeight)
			if err != nil {
				fmt.Printf("Failed to get block %d: %v\n", blockHeight, err)
				return // Use return to exit goroutine on error
			}

			for _, txBytes := range block.Block.Txs {
				var rawTx tx.Tx
				err = cdc.Unmarshal(txBytes, &rawTx)
				if err != nil {
					// fmt.Printf("Failed to unmarshal transaction (block %d, tx data: %X): %v\n", blockHeight, txBytes, err)
					continue
				}

				memo := rawTx.GetBody().GetMemo()
				if memo != "" && strings.Contains(strings.ToLower(memo), "dither") {
					txHash := strings.ToUpper(fmt.Sprintf("%X", cftypes.Tx(txBytes).Hash()))

					for _, msgAny := range rawTx.GetBody().GetMessages() {
						var unpackedMsg sdk.Msg
						err := cdc.UnpackAny(msgAny, &unpackedMsg)
						if err != nil {
							// fmt.Printf("Failed to unpack message Any: %v\n", err)
							continue
						}

						if sendMsg, ok := unpackedMsg.(*banktypes.MsgSend); ok {
							tr := TransactionResult{
								Height:    blockHeight,
								TxHash:    txHash,
								Memo:      memo,
								Recipient: sendMsg.ToAddress,
								Amount:    sendMsg.Amount.String(),
							}
							mu.Lock() // Protect the shared slice
							foundTransactions = append(foundTransactions, tr)
							mu.Unlock()
							break
						}
					}
				}
			}

		}(currentBlockHeight)
	}

	wg.Wait()
	close(blockProcessingLimiter)

	fmt.Println("\n--- Dither Memos Found ---")
	if len(foundTransactions) == 0 {
		fmt.Println("No bank transactions with 'dither' in the memo were found in the scanned blocks.")
	} else {
		for _, tr := range foundTransactions {
			fmt.Printf("Block: %d, TxHash: %s, Recipient: %s, Amount: %s, Memo: \"%s\"\n",
				tr.Height, tr.TxHash, tr.Recipient, tr.Amount, tr.Memo)
		}
	}
}

// reads from config.json for the endpoint
func loadConfig(filename string) (*Config, error) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file %s: %w", filename, err)
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config data: %w", err)
	}
	return &config, nil
}