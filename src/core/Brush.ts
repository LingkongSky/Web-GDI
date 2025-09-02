import { GdiObject } from './GdiObject';
import { BrushStyle } from '../enums/BrushStyle';
import { Color } from '../utils/Color';
import { HatchStyle } from '../enums/HatchStyle';

export class Brush extends GdiObject {
    private style: BrushStyle;
    private color: number;
    private hatch: HatchStyle;

    constructor(style: BrushStyle = BrushStyle.BS_SOLID, color: number = 0xFFFFFF, hatch: HatchStyle = HatchStyle.HS_HORIZONTAL) {
        super();
        this.style = style;
        this.color = color;
        this.hatch = hatch;
    }

    GetStyle(): BrushStyle {
        return this.style;
    }

    GetColor(): number {
        return this.color;
    }

    GetHatch(): HatchStyle {
        return this.hatch;
    }

    SetStyle(style: BrushStyle): void {
        this.style = style;
    }

    SetColor(color: number): void {
        this.color = color;
    }

    SetHatch(hatch: HatchStyle): void {
        this.hatch = hatch;
    }

    Clone(): Brush {
        return new Brush(this.style, this.color, this.hatch);
    }

    ToString(): string {
        return `Brush(style=${BrushStyle[this.style]}, color=${Color.toHex(this.color)}, hatch=${HatchStyle[this.hatch]})`;
    }
}