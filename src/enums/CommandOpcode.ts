export enum CommandOpcode {
    CMD_TEXT = 0x01,
    CMD_LINE = 0x02,
    CMD_RECT = 0x03,
    CMD_ELLIPSE = 0x04,
    CMD_BITBLT = 0x05,
    CMD_SET_DIBITS = 0x06,
    CMD_CREATE_PEN = 0x10,
    CMD_CREATE_BRUSH = 0x11,
    CMD_SEL_OBJ = 0x12,
    CMD_MOVETO = 0x13,
    CMD_FRAME_END = 0xFF,
    CMD_DELETE_OBJ = 0x14,
    CMD_DC_STATE = 0x15,
    CMD_SET_ROP2 = 0x16,
    CMD_SET_PIXEL = 0x18,
    CMD_CREATE_DC = 0x20,
    CMD_CREATE_BITMAP = 0x21,
    CMD_DELETE_DC = 0x22,
}







