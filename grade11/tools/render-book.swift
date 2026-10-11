// render-book.swift — kết xuất trang PDF sách thành JPG bằng PDFKit của macOS
// (nhanh: ~0.3 s/trang; pypdf giải mã ảnh trang mất vài phút/trang).
//
//   swiftc -O tools/render-book.swift -o <scratchpad>/render-book
//   W=1200 <scratchpad>/render-book "../Sách Tiếng anh 11 Global success - Sách học sinh.pdf" <outdir> 38 39 40
//
// Chỉ số trang PDF = số trang in trên sách (p.29 = chỉ số 29). W = bề ngang ảnh (mặc định 1200;
// 3600 khi cần cắt tranh trong sách làm ảnh slide). Ảnh ra: <outdir>/p<N>.jpg
// Chỉ dùng lúc dựng bài. KHÔNG phải một phần của trang chạy.
import Foundation
import PDFKit
import AppKit
let args = CommandLine.arguments
let doc = PDFDocument(url: URL(fileURLWithPath: args[1]))!
let outDir = args[2]
let width = CGFloat(Double(ProcessInfo.processInfo.environment["W"] ?? "1200")!)
for s in args[3...] {
  let i = Int(s)!
  guard let page = doc.page(at: i) else { continue }
  let r = page.bounds(for: .mediaBox)
  let scale = width / r.width
  let w = Int(r.width * scale), h = Int(r.height * scale)
  let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h, bitsPerSample: 8,
                             samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                             colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  NSGraphicsContext.saveGraphicsState()
  let ctx = NSGraphicsContext(bitmapImageRep: rep)!
  NSGraphicsContext.current = ctx
  let cg = ctx.cgContext
  cg.setFillColor(NSColor.white.cgColor); cg.fill(CGRect(x: 0, y: 0, width: w, height: h))
  cg.scaleBy(x: scale, y: scale)
  page.draw(with: .mediaBox, to: cg)
  NSGraphicsContext.restoreGraphicsState()
  let data = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.85])!
  try! data.write(to: URL(fileURLWithPath: "\(outDir)/p\(i).jpg"))
  print(i, w, h)
}
