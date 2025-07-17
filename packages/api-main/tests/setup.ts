import { start, stop } from '../src/index';

export async function setup() {
    start();
}

export async function teardown() {
    stop();
}
