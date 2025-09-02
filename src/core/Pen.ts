import { GdiObject } from './GdiObject';
import { PenStyle } from '../enums/PenStyle';
import { Color } from '../utils/Color';

export class Pen extends GdiObject {
    private style: PenStyle;
    private width: number;
    private color: number;

    constructor(style: PenStyle = PenStyle.PS_SOLID, width: number = 1, color: number = 0) {
        super();
        this.style = style;
        this.width = width;
        this.color = color;
    }

    GetStyle(): PenStyle {
        return this.style;
    }

    GetWidth(): number {
        return this.width;
    }

    GetColor(): number {
        return this.color;
    }

    SetStyle(style: PenStyle): void {
        this.style = style;
    }

    SetWidth(width: number): void {
        this.width = width;
    }

    SetColor(color: number): void {
        this.color = color;
    }

    Clone(): Pen {
        return new Pen(this.style, this.width, this.color);
    }

    ToString(): string {
        return `Pen(style=${PenStyle[this.style]}, width=${this.width}, color=${Color.toHex(this.color)})`;
    }
}