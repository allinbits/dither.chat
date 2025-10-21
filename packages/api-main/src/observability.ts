import type { Config } from './config';

import { opentelemetry } from '@elysiajs/opentelemetry';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';

export function observability(config: Config) {
    return opentelemetry({
        serviceName: process.env.FLY_APP_NAME || 'api-main',
        resource: resourceFromAttributes({
            'service.group': 'dither.chat',
        }),
        spanProcessors: [
            new BatchSpanProcessor(
                new OTLPTraceExporter({
                    url: config.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
                    headers: config.OTEL_EXPORTER_OTLP_HEADERS
                        ? Object.fromEntries(
                                config.OTEL_EXPORTER_OTLP_HEADERS.split(',').map(kv => kv.split('=')))
                        : undefined,
                }),
            ),
        ],
    });
}
