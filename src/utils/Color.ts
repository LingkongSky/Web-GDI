export class Color {
    static RGB(r: number, g: number, b: number): number {
        return (r << 16) | (g << 8) | b;
    }

    static getRed(color: number): number {
        return (color >> 16) & 0xff;
    }

    static getGreen(color: number): number {
        return (color >> 8) & 0xff;
    }

    static getBlue(color: number): number {
        return color & 0xff;
    }

    static toHex(color: number): string {
        return `#${color.toString(16).padStart(6, '0')}`;
    }
}

