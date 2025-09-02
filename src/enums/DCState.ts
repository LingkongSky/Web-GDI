import { Point } from "../types/GdiTypes";
import { BkMode } from "./BkMode";
import { MapMode } from "./MapMode";
import { PolyFillMode } from "./PolyFillMode";
import { RasterOp } from "./RasterOp";
import { StretchMode } from "./StretchMode";
import { TextAlign } from "./TextAlign";

export interface DCState {
    currentPos: Point;
    textColor: number;
    bkColor: number;
    bkMode: BkMode;
    textAlign: TextAlign;
    rop2: RasterOp;
    mapMode: MapMode;
    viewportOrg: Point;
    windowOrg: Point;
    stretchMode: StretchMode;
    polyFillMode: PolyFillMode;
    currentPenId: number;
    currentBrushId: number;
}