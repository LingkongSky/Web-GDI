import { v4 as uuidv4 } from 'uuid';

export abstract class GdiObject {
    protected id: string;
    protected stock: boolean = false;

    constructor() {
        this.id = uuidv4();
    }

    getId(): string {
        return this.id;
    }

    isStock(): boolean {
        return this.stock;
    }

    setStock(stock: boolean): void {
        this.stock = stock;
    }

}