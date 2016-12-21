var chart = anychart.column([1, 2, 3, 4, 5]);
chart.title()
    .enabled(true)
    .text('Bla-bla')
    .fontStyle('italic')
    .fontWeight('bold')
    .fontFamily('Verdana')
    .fontSize(42);
chart.bounds(0, 0, 500, 600);
chart.container('container').draw();