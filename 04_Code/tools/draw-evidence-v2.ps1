# Original schematic evidence illustrations. These are explanatory game art,
# not reconstructions of surviving historical objects. Existing art is preserved.
Add-Type -AssemblyName System.Drawing
$artRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../02_Art/evidence-v2-schematics'))
$levelRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../levels/xiaoshan-demo/assets'))
[IO.Directory]::CreateDirectory($artRoot) | Out-Null
function Color($hex) { [Drawing.ColorTranslator]::FromHtml($hex) }
function Pen($hex,$width) { [Drawing.Pen]::new((Color $hex),[single]$width) }
function Brush($hex) { [Drawing.SolidBrush]::new((Color $hex)) }
function Stroke($g,$hex,$width,$points) {
 $pen=Pen $hex $width; $pen.StartCap='Round';$pen.EndCap='Round';$pen.LineJoin='Round'
 $g.DrawLines($pen,[Drawing.PointF[]]$points);$pen.Dispose()
}
function Point($x,$y) { [Drawing.PointF]::new([single]$x,[single]$y) }
foreach($id in 3..8) {
 $bitmap=[Drawing.Bitmap]::new(768,576);$g=[Drawing.Graphics]::FromImage($bitmap)
 $g.SmoothingMode='AntiAlias';$g.Clear((Color '#e5d9bb'))
 $rng=[Random]::new(2718+$id)
 $texture=Pen '#d5c8a8' 1
 for($n=0;$n -lt 1100;$n++) { $x=$rng.Next(768);$y=$rng.Next(576);$g.DrawLine($texture,$x,$y,$x+$rng.Next(1,6),$y) }
 $texture.Dispose()
 $shadow=[Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(28,51,37,20));$g.FillEllipse($shadow,130,410,510,55);$shadow.Dispose()
 switch($id) {
  3 {
   $shape=[Drawing.PointF[]]@((Point 190 135),(Point 315 110),(Point 336 169),(Point 432 169),(Point 453 110),(Point 578 135),(Point 649 398),(Point 508 452),(Point 382 418),(Point 260 452),(Point 119 398))
   $brush=Brush '#977251';$g.FillPolygon($brush,$shape);$brush.Dispose();$pen=Pen '#533e2d' 5;$g.DrawPolygon($pen,$shape);$pen.Dispose()
   Stroke $g '#c3a17a' 4 @((Point 210 160),(Point 170 381),(Point 267 414),(Point 376 388))
   Stroke $g '#6b4c35' 3 @((Point 333 172),(Point 284 377));Stroke $g '#6b4c35' 3 @((Point 435 172),(Point 488 377))
   for($n=0;$n -lt 160;$n++){$x=$rng.Next(230,540);$y=$rng.Next(205,370);$p=Pen '#a78562' 1;$g.DrawEllipse($p,$x,$y,2,2);$p.Dispose()}
  }
  4 {
   $metal=[Drawing.PointF[]]@((Point 231 386),(Point 501 170),(Point 292 422));$b=Brush '#69736b';$g.FillPolygon($b,$metal);$b.Dispose()
   Stroke $g '#c0c4af' 3 @((Point 265 391),(Point 493 180));Stroke $g '#343d38' 3 @((Point 293 421),(Point 501 170))
   $b=Brush '#765034';$g.TranslateTransform(235,390);$g.RotateTransform(-40);$g.FillEllipse($b,-80,-29,170,58);$b.Dispose();$p=Pen '#3d3025' 4;$g.DrawEllipse($p,-80,-29,170,58);$p.Dispose()
   Stroke $g '#a3794f' 3 @((Point -63 -11),(Point 66 -11));Stroke $g '#543921' 3 @((Point -55 12),(Point 58 12));$g.ResetTransform()
  }
  5 {
   Stroke $g '#302e29' 22 @((Point 150 220),(Point 260 205),(Point 370 290),(Point 485 380),(Point 624 355))
   Stroke $g '#575346' 9 @((Point 151 214),(Point 260 199),(Point 372 284),(Point 487 374),(Point 620 350))
   Stroke $g '#39362e' 20 @((Point 150 365),(Point 263 381),(Point 383 284),(Point 485 195),(Point 625 219))
   Stroke $g '#625c4d' 6 @((Point 154 358),(Point 260 375),(Point 379 279),(Point 487 190),(Point 621 214))
   $p=Pen '#3b3428' 9;$g.DrawEllipse($p,321,237,126,104);$p.Dispose()
   foreach($y in 217,353){for($n=0;$n -lt 7;$n++){Stroke $g '#575043' 2 @((Point 622 ($y+$n-3)),(Point (646+$rng.Next(16)) ($y+$rng.Next(-15,16))))}}
  }
  6 {
   for($n=0;$n -lt 135;$n++){
    $offset=$rng.NextDouble()*54-27;$pts=@();for($i=0;$i -lt 16;$i++){$y=108+$i*22;$x=375+$offset+[Math]::Sin($i*.32)*24;$pts+=Point $x $y}
    Stroke $g @('#242823','#393c30','#555242','#77705b')[$n%4] 1.4 $pts
   }
   Stroke $g '#8e5c3a' 11 @((Point 342 168),(Point 412 168));Stroke $g '#b28555' 3 @((Point 342 165),(Point 412 165))
  }
  {$_ -in 7,8} {
   $fiber=$id -eq 8
   for($strand=0;$strand -lt 3;$strand++){
    $points=@();for($i=0;$i -lt 66;$i++){$y=104+$i*4.8;$x=383+28*[Math]::Sin($i*.23+$strand*2.094);$points+=Point $x $y}
    Stroke $g '#292b25' 20 $points;Stroke $g $(if($fiber){'#635947'}else{'#454638'}) 11 $points
   }
   for($n=0;$n -lt 36;$n++){
    $points=@();for($i=0;$i -lt 13;$i++){$y=407+$i*5;$x=383+($n-18)*.7+[Math]::Sin($i*.4+$n)*$(if($fiber){4}else{1.5});$points+=Point $x $y}
    Stroke $g $(if($fiber){'#61533d'}else{'#33372d'}) 1.5 $points
   }
   if($fiber){for($n=0;$n -lt 11;$n++){$y=427+$n*4;Stroke $g '#817056' 1.5 @((Point 364 $y),(Point 402 ($y+1)))}}
  }
 }
 $g.Dispose();$name='evidence_ev_{0:d2}.png' -f $id
 $bitmap.Save((Join-Path $artRoot $name),[Drawing.Imaging.ImageFormat]::Png);$bitmap.Dispose()
 Copy-Item -LiteralPath (Join-Path $artRoot $name) -Destination (Join-Path $levelRoot $name)
}
Write-Output 'Created six separate original evidence schematics; prior artwork preserved.'
