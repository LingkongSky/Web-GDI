# English
## Overview

Web-GDI is a TypeScript library that implements a compatibility layer for the Windows Graphics Device Interface (GDI) on top of the Node. It allows developers familiar with the Win32 GDI programming model to leverage their knowledge to create graphics applications that run in a Node.js or browser environment.

This library provides abstractions for core GDI objects such as Pens, Brushes, Fonts, Bitmaps, and Device Contexts, along with a wide array of drawing functions and state management capabilities.
## Features

- GDI Object Modeling: Implementations of Pen, Brush, Font, and Bitmap classes.
- Device Context : A central DeviceContext class that manages drawing states and operations, mirroring the HDC concept.
- Drawing Functions: Common GDI functions like MoveTo, LineTo, Rectangle, Ellipse, TextOut, SetPixel, BitBlt, and StretchBlt are supported.
- Raster Operations : Supports various raster operations like R2_COPYPEN, R2_XORPEN, R2_NOT, etc.
- State Management: The DC state can be retrieved and restored.
- Mapping Modes: Basic support for mapping modes .

## Installation

    npm install web-gdi 

## Usage Example
```
    import { DeviceContext, Pen, Brush } from 'web-gdi';
    import { PenStyle, BrushStyle, HatchStyle, RasterOp } from 'web-gdi/enums';

    // Create a new Device Context
    const dc = new DeviceContext(800, 600);

    // Create GDI objects
    const redPen = new Pen(PenStyle.PS_SOLID, 2, 0xFF0000);
    const blueBrush = new Brush(BrushStyle.BS_HATCHED, 0x0000FF, HatchStyle.HS_CROSS);

    // Select them into the DC
    dc.SelectObject(redPen);
    dc.SelectObject(blueBrush);

    // Set some DC attributes
    dc.SetROP2(RasterOp.R2_COPYPEN);
    dc.SetBkMode(2);
    dc.SetTextColor(0x00FF00);

    // Perform drawing operations
    dc.Rectangle(50, 50, 300, 200);
    dc.Ellipse(400, 100, 600, 250);
    dc.MoveTo(10, 10);
    dc.LineTo(100, 150);
    dc.TextOut(200, 300, "Hello, Web-GDI!");

    // Get the final image as a buffer
    const imageBuffer = dc.ToBuffer();
```
## API Overview

The library strives to mirror the GDI API structure. Key components include:

    DeviceContext: The main class for all drawing operations.   

    Pen: Defines line style, width, and color.  

    BiBrush: Defines fill style, color, and hatch pattern.  

    Font: Defines font face, size, weight, and style.   

    Bitmap: Represents an off-screen drawing surface.   

    Enums: Various enums (PenStyle, BrushStyle, HatchStyle, RasterOp, BkMode, etc.) for specifying parameters.

## License
Web-GDI is released under the MIT.


# 简体中文
## 概述

Web-GDI是一个TypeScript库，用于实现Windows图形设备接口GDI的兼容层。可以让熟悉Win32 GDI编程模型的开发者能够利用其知识来创建可运行于Node.js或浏览器环境的图形应用程序。

该库为核心GDI对象提供了抽象实现，并包含大量的绘图函数和状态管理功能。
## 特性

- GDI对象建模: 尽量参照原型实现了Pen、Brush、Font和Bitmap类。
- 设备上下文: 一个核心的DeviceContext类，用于管理绘图状态和操作，和模拟HDC
- 绘图函数: 支持常见的GDI函数，如MoveTo, LineTo, Rectangle, Ellipse, TextOut, SetPixel, BitBlt和StretchBlt
- 光栅操作: 支持多种光栅操作，如R2_COPYPEN, R2_XORPEN, R2_NOT等
- 状态管理: 可以获取和恢复DC的状态
- 映射模式: 基本支持映射模式

## 安装
    npm install web-gdi

## 使用示例
```
    import { DeviceContext, Pen, Brush } from 'web-gdi';
    import { PenStyle, BrushStyle, HatchStyle, RasterOp } from 'web-gdi/enums';

    // 创建一个新的设备上下文
    const dc = new DeviceContext(800, 600);

    // 创建GDI对象
    const redPen = new Pen(PenStyle.PS_SOLID, 2, 0xFF0000);
    const blueBrush = new Brush(BrushStyle.BS_HATCHED, 0x0000FF, HatchStyle.HS_CROSS);

    // 将它们选入DC
    dc.SelectObject(redPen);
    dc.SelectObject(blueBrush);

    // 设置一些DC属性
    dc.SetROP2(RasterOp.R2_COPYPEN);
    dc.SetBkMode(2);
    dc.SetTextColor(0x00FF00);

    // 执行绘图操作
    dc.Rectangle(50, 50, 300, 200);
    dc.Ellipse(400, 100, 600, 250);
    dc.MoveTo(10, 10);
    dc.LineTo(100, 150);
    dc.TextOut(200, 300, "Hello, Web-GDI!");

    // 获取最终图像作为缓冲区
    const imageBuffer = dc.ToBuffer();
```

## API 概述

该库用于模拟GDI API的结构。关键组件包括：

    DeviceContext: 所有绘图操作的主类。

    Pen: 定义线条样式、宽度和颜色。

    Brush: 定义填充样式、颜色和阴影图案。

    Font: 定义字体、大小、粗细和样式。

    Bitmap: 表示一个离屏绘图表面。

    Enums: 各种枚举（PenStyle, BrushStyle, HatchStyle, RasterOp, BkMode）用于指定参数。

## 协议
Web-GDI遵守MIT协议.