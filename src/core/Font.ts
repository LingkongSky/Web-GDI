import { GdiObject } from './GdiObject';

export class Font extends GdiObject {
    private face: string;
    private size: number;
    private weight: number;
    private italic: boolean;
    private underline: boolean;
    private strikeout: boolean;

    constructor(
        face: string = 'Arial',
        size: number = 12,
        weight: number = 400
    ) {
        super();
        this.face = face;
        this.size = size;
        this.weight = weight;
        this.italic = false;
        this.underline = false;
        this.strikeout = false;
    }

    GetFace(): string {
        return this.face;
    }

    GetSize(): number {
        return this.size;
    }

    GetWeight(): number {
        return this.weight;
    }

    IsItalic(): boolean {
        return this.italic;
    }

    IsUnderline(): boolean {
        return this.underline;
    }

    IsStrikeout(): boolean {
        return this.strikeout;
    }

    SetFace(face: string): void {
        this.face = face;
    }

    SetSize(size: number): void {
        this.size = size;
    }

    SetWeight(weight: number): void {
        this.weight = weight;
    }

    SetItalic(italic: boolean): void {
        this.italic = italic;
    }

    SetUnderline(underline: boolean): void {
        this.underline = underline;
    }

    SetStrikeout(strikeout: boolean): void {
        this.strikeout = strikeout;
    }

    Clone(): Font {
        const font = new Font(this.face, this.size, this.weight);
        font.SetItalic(this.italic);
        font.SetUnderline(this.underline);
        font.SetStrikeout(this.strikeout);
        return font;
    }

    ToString(): string {
        return `Font(face=${this.face}, size=${this.size}, weight=${this.weight})`;
    }

    // 创建预定义字体
    static CreateDefaultFont(): Font {
        return new Font('Arial', 12, 400);
    }

    static CreateBoldFont(): Font {
        return new Font('Arial', 12, 700);
    }

    static CreateItalicFont(): Font {
        const font = new Font('Arial', 12, 400);
        font.SetItalic(true);
        return font;
    }
}