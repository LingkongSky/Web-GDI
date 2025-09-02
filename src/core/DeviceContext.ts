import { Pen } from './Pen';
import { Brush } from './Brush';
import { Font } from './Font';
import { Bitmap } from './Bitmap';
import { Point, Rect, Size } from '../types/GdiTypes';
import { RasterOp } from '../enums/RasterOp';
import { BrushStyle } from '../enums/BrushStyle';
import { PenStyle } from '../enums/PenStyle';
import { HatchStyle } from '../enums/HatchStyle';
import { createCanvas, Canvas, CanvasRenderingContext2D, CanvasPattern } from 'canvas';
import { Color } from '../utils/Color';
import { GdiObject } from './GdiObject';
import { BkMode } from '../enums/BkMode';
import { DCState } from '../enums/DCState';
import { MapMode } from '../enums/MapMode';
import { PolyFillMode } from '../enums/PolyFillMode';
import { StretchMode } from '../enums/StretchMode';
import { TextAlign } from '../enums/TextAlign';

export class DeviceContext {
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;
  private currentPen: Pen;
  private currentBrush: Brush;
  private currentFont: Font;
  private currentBitmap: Bitmap | null = null;
  private rasterOp: RasterOp = RasterOp.R2_COPYPEN;
  private textColor: number = 0x000000;
  private bkColor: number = 0xFFFFFF;
  private bkMode: number = 1; // 1=OPAQUE, 2=TRANSPARENT
  private textAlign: TextAlign = TextAlign.TA_LEFT;
  private mapMode: MapMode = MapMode.MM_TEXT;
  private viewportOrg: Point = { x: 0, y: 0 };
  private windowOrg: Point = { x: 0, y: 0 };
  private stretchMode: StretchMode = StretchMode.STRETCH_ANDSCANS;
  private polyFillMode: PolyFillMode = PolyFillMode.WINDING;
  private currentPenId: number = 0;
  private currentBrushId: number = 0;
  private currentPos: Point = { x: 0, y: 0 };

  constructor(width: number = 800, height: number = 600) {
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext('2d');
    this.currentPen = new Pen();
    this.currentBrush = new Brush();
    this.currentFont = new Font();
  }

  // GDI 兼容函数
  static CreateCompatibleDC(hdc?: DeviceContext): DeviceContext {
    if (hdc) {
      return new DeviceContext(hdc.canvas.width, hdc.canvas.height);
    }
    return new DeviceContext();
  }

  // 创建兼容位图
  static CreateCompatibleBitmap(hdc: DeviceContext, width: number, height: number): Bitmap {
    return new Bitmap(width, height);
  }

  // 对象操作
  SelectObject(object: GdiObject): GdiObject {
    if (object instanceof Pen) {
      const old = this.currentPen;
      this.currentPen = object;
      return old;
    } else if (object instanceof Brush) {
      const old = this.currentBrush;
      this.currentBrush = object;
      return old;
    } else if (object instanceof Font) {
      const old = this.currentFont;
      this.currentFont = object;
      return old;
    } else if (object instanceof Bitmap) {
      const old = this.currentBitmap;
      this.currentBitmap = object;
      if (object) {
        this.ctx = object.GetContext();
      }
      return old!;
    }
    throw new Error('Unsupported GDI object type');
  }

  // 删除对象
  DeleteObject(object: GdiObject): boolean {
    if (object === this.currentPen) {
      this.currentPen = new Pen();
    } else if (object === this.currentBrush) {
      this.currentBrush = new Brush();
    } else if (object === this.currentFont) {
      this.currentFont = new Font();
    } else if (object === this.currentBitmap) {
      this.currentBitmap = null;
      this.ctx = this.canvas.getContext('2d');
    }
    return true;
  }

  // 绘图函数
  MoveTo(x: number, y: number): Point {
    const oldPos = { ...this.currentPos };
    this.currentPos = { x, y };
    this.ctx.moveTo(x, y);
    return oldPos;
  }

  LineTo(x: number, y: number): boolean {
    this.applyPenStyle();
    this.ctx.beginPath();
    this.ctx.moveTo(this.currentPos.x, this.currentPos.y);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.currentPos = { x, y };
    return true;
  }
  Rectangle(left: number, top: number, right: number, bottom: number): boolean {
    this.applyPenStyle();
    this.applyBrushStyle();

    this.ctx.beginPath();
    this.ctx.rect(left, top, right - left, bottom - top);

    if (this.currentBrush.GetStyle() !== BrushStyle.BS_NULL) {
      this.ctx.fill();
    }

    if (this.currentPen.GetStyle() !== PenStyle.PS_NULL) {
      this.ctx.stroke();
    }

    return true;
  }

  Ellipse(left: number, top: number, right: number, bottom: number): boolean {
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    const radiusX = (right - left) / 2;
    const radiusY = (bottom - top) / 2;

    this.applyPenStyle();
    this.applyBrushStyle();

    this.ctx.beginPath();
    this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);

    if (this.currentBrush.GetStyle() !== BrushStyle.BS_NULL) {
      this.ctx.fill();
    }

    if (this.currentPen.GetStyle() !== PenStyle.PS_NULL) {
      this.ctx.stroke();
    }

    return true;
  }

  TextOut(x: number, y: number, text: string): boolean {
    this.applyFontStyle();
    this.ctx.fillStyle = Color.toHex(this.textColor);

    // 处理背景模式
    if (this.bkMode === 1) { // OPAQUE
      const metrics = this.ctx.measureText(text);
      this.ctx.fillStyle = Color.toHex(this.bkColor);
      this.ctx.fillRect(x, y - metrics.actualBoundingBoxAscent,
        metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
      this.ctx.fillStyle = Color.toHex(this.textColor);
    }

    this.ctx.fillText(text, x, y);
    return true;
  }

  // 属性设置
  SetROP2(rop: RasterOp): number {
    const oldRop = this.rasterOp;
    this.rasterOp = rop;

    switch (rop) {
      case RasterOp.R2_BLACK:
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = '#000000';
        this.ctx.fillStyle = '#000000';
        break;
      case RasterOp.R2_WHITE:
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.fillStyle = '#FFFFFF';
        break;
      case RasterOp.R2_COPYPEN:
        this.ctx.globalCompositeOperation = 'source-over';
        // 恢复原来的颜色
        this.applyPenStyle();
        this.applyBrushStyle();
        break;
      case RasterOp.R2_NOT:
        this.ctx.globalCompositeOperation = 'difference';
        break;
      case RasterOp.R2_XORPEN:
        this.ctx.globalCompositeOperation = 'xor';
        break;
      default:
        this.ctx.globalCompositeOperation = 'source-over';
    }

    return oldRop;
  }


  SetTextColor(color: number): number {
    const oldColor = this.textColor;
    this.textColor = color;
    return oldColor;
  }


  SetTextAlign(align: TextAlign): TextAlign {
    const oldAlign = this.textAlign;
    this.textAlign = align;

    // 设置Canvas文本对齐
    switch (align) {
      case TextAlign.TA_LEFT:
        this.ctx.textAlign = 'left';
        break;
      case TextAlign.TA_CENTER:
        this.ctx.textAlign = 'center';
        break;
      case TextAlign.TA_RIGHT:
        this.ctx.textAlign = 'right';
        break;
    }

    return oldAlign;
  }

  // 设置背景模式
  SetBkMode(mode: BkMode): BkMode {
    const oldMode = this.bkMode;
    this.bkMode = mode;
    return oldMode;
  }

  // 设置背景颜色
  SetBkColor(color: number): number {
    const oldColor = this.bkColor;
    this.bkColor = color;
    return oldColor;
  }

  // 设置像素
  SetPixel(x: number, y: number, color: number): number {
    this.ctx.fillStyle = Color.toHex(color);
    this.ctx.fillRect(x, y, 1, 1);
    return color;
  }

  // 设置映射模式
  SetMapMode(mode: MapMode): MapMode {
    const oldMode = this.mapMode;
    this.mapMode = mode;
    return oldMode;
  }

  // 设置视口原点
  SetViewportOrg(x: number, y: number): Point {
    const oldOrg = { ...this.viewportOrg };
    this.viewportOrg = { x, y };
    return oldOrg;
  }

  // 设置窗口原点
  SetWindowOrg(x: number, y: number): Point {
    const oldOrg = { ...this.windowOrg };
    this.windowOrg = { x, y };
    return oldOrg;
  }

  // 设置拉伸模式
  SetStretchBltMode(mode: StretchMode): StretchMode {
    const oldMode = this.stretchMode;
    this.stretchMode = mode;
    return oldMode;
  }

  // 设置多边形填充模式
  SetPolyFillMode(mode: PolyFillMode): PolyFillMode {
    const oldMode = this.polyFillMode;
    this.polyFillMode = mode;
    return oldMode;
  }

  // 获取当前DC状态
  GetDCState(): DCState {
    return {
      currentPos: { ...this.currentPos },
      textColor: this.textColor,
      bkColor: this.bkColor,
      bkMode: this.bkMode,
      textAlign: this.textAlign,
      rop2: this.rasterOp,
      mapMode: this.mapMode,
      viewportOrg: { ...this.viewportOrg },
      windowOrg: { ...this.windowOrg },
      stretchMode: this.stretchMode,
      polyFillMode: this.polyFillMode,
      currentPenId: this.currentPenId,
      currentBrushId: this.currentBrushId,
    };
  }

  // 设置DC状态
  SetDCState(state: DCState): void {
    this.currentPos = { ...state.currentPos };
    this.textColor = state.textColor;
    this.bkColor = state.bkColor;
    this.bkMode = state.bkMode;
    this.textAlign = state.textAlign;
    this.SetROP2(state.rop2);
    this.mapMode = state.mapMode;
    this.viewportOrg = { ...state.viewportOrg };
    this.windowOrg = { ...state.windowOrg };
    this.stretchMode = state.stretchMode;
    this.polyFillMode = state.polyFillMode;
    this.currentPenId = state.currentPenId;
    this.currentBrushId = state.currentBrushId;
  }

  // 辅助方法
  private applyPenStyle(): void {
    const pen = this.currentPen;
    this.ctx.strokeStyle = Color.toHex(pen.GetColor());
    this.ctx.lineWidth = pen.GetWidth();

    switch (pen.GetStyle()) {
      case PenStyle.PS_DASH:
        this.ctx.setLineDash([5, 5]);
        break;
      case PenStyle.PS_DOT:
        this.ctx.setLineDash([2, 2]);
        break;
      case PenStyle.PS_DASHDOT:
        this.ctx.setLineDash([5, 2, 2, 2]);
        break;
      default:
        this.ctx.setLineDash([]);
    }
  }

  private applyBrushStyle(): void {
    const brush = this.currentBrush;

    if (brush.GetStyle() === BrushStyle.BS_SOLID) {
      this.ctx.fillStyle = Color.toHex(brush.GetColor());
    } else if (brush.GetStyle() === BrushStyle.BS_HATCHED) {
      const pattern = this.createHatchPattern(brush.GetHatch(), brush.GetColor());
      if (pattern) {
        this.ctx.fillStyle = pattern;
      }
    } else if (brush.GetStyle() === BrushStyle.BS_NULL) {
      this.ctx.fillStyle = 'transparent';
    }
  }

  private applyFontStyle(): void {
    const font = this.currentFont;
    let style = '';

    if (font.IsItalic()) {
      style += 'italic ';
    }

    style += `${font.GetWeight()} `;

    this.ctx.font = `${style}${font.GetSize()}px ${font.GetFace()}`;
  }

  private createHatchPattern(hatch: HatchStyle, color: number): CanvasPattern | null {
    const size = 8;
    const patternCanvas = createCanvas(size, size);
    const patternCtx = patternCanvas.getContext('2d');
    const colorHex = Color.toHex(color);

    patternCtx.fillStyle = 'transparent';
    patternCtx.fillRect(0, 0, size, size);

    patternCtx.strokeStyle = colorHex;
    patternCtx.lineWidth = 1;

    switch (hatch) {
      case HatchStyle.HS_HORIZONTAL:
        patternCtx.beginPath();
        patternCtx.moveTo(0, size / 2);
        patternCtx.lineTo(size, size / 2);
        patternCtx.stroke();
        break;
      case HatchStyle.HS_VERTICAL:
        patternCtx.beginPath();
        patternCtx.moveTo(size / 2, 0);
        patternCtx.lineTo(size / 2, size);
        patternCtx.stroke();
        break;
      case HatchStyle.HS_FDIAGONAL:
        patternCtx.beginPath();
        patternCtx.moveTo(0, 0);
        patternCtx.lineTo(size, size);
        patternCtx.stroke();
        break;
      case HatchStyle.HS_BDIAGONAL:
        patternCtx.beginPath();
        patternCtx.moveTo(size, 0);
        patternCtx.lineTo(0, size);
        patternCtx.stroke();
        break;
      case HatchStyle.HS_CROSS:
        patternCtx.beginPath();
        patternCtx.moveTo(0, size / 2);
        patternCtx.lineTo(size, size / 2);
        patternCtx.moveTo(size / 2, 0);
        patternCtx.lineTo(size / 2, size);
        patternCtx.stroke();
        break;
      case HatchStyle.HS_DIAGCROSS:
        patternCtx.beginPath();
        patternCtx.moveTo(0, 0);
        patternCtx.lineTo(size, size);
        patternCtx.moveTo(size, 0);
        patternCtx.lineTo(0, size);
        patternCtx.stroke();
        break;
      default:
        return null;
    }

    return this.ctx.createPattern(patternCanvas, 'repeat');
  }



  // 位图操作
  BitBlt(
    x: number,
    y: number,
    width: number,
    height: number,
    srcDC: DeviceContext,
    xSrc: number = 0,
    ySrc: number = 0,
    rop: RasterOp = RasterOp.R2_COPYPEN
  ): boolean {
    const oldRop = this.rasterOp;
    this.SetROP2(rop);
    this.ctx.drawImage(
      srcDC.GetCanvas(),
      xSrc, ySrc, width, height,
      x, y, width, height
    );
    this.SetROP2(oldRop);
    return true;
  }


  StretchBlt(
    x: number,
    y: number,
    width: number,
    height: number,
    srcDC: DeviceContext,
    xSrc: number = 0,
    ySrc: number = 0,
    srcWidth: number,
    srcHeight: number,
    rop: RasterOp = RasterOp.R2_COPYPEN
  ): boolean {
    const oldRop = this.rasterOp;
    this.SetROP2(rop);
    this.ctx.drawImage(
      srcDC.GetCanvas(),
      xSrc, ySrc, srcWidth, srcHeight,
      x, y, width, height
    );
    this.SetROP2(oldRop);
    return true;
  }


  // 获取内部Canvas对象
  GetCanvas(): Canvas {
    if (this.currentBitmap) {
      return this.currentBitmap.GetCanvas();
    }
    return this.canvas;
  }

  // 获取上下文
  GetContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  // 保存为Buffer
  ToBuffer(): Buffer {
    return this.GetCanvas().toBuffer();
  }

  // 保存为Data URL
  ToDataURL(): string {
    return this.GetCanvas().toDataURL();
  }


}