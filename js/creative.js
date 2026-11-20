/*!
 * Start Bootstrap - Creative Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

(function($) {
    "use strict"; // Start of use strict

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 68)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 51
    })

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });

    // Offset for Main Navigation
    $('#mainNav').affix({
        offset: {
            top: 100
        }
    })

    // Draggable node graphs (hero and contact). Each wire is redrawn from the
    // pin offsets recorded in its data-w attribute: "fromNode:x,y>toNode:x,y".
    // A wire from "fix" starts at a fixed point and enters from above.
    $('.hero-graph, .contact-graph').each(function() {
        var svg = this, vb = svg.viewBox.baseVal, nodes = {}, wires = [];

        $(svg).find('.node').each(function() {
            var m = /translate\(([-\d.]+)[ ,]([-\d.]+)\)/.exec(this.getAttribute('transform'));
            var r = this.querySelector('rect');
            nodes[this.getAttribute('data-n')] = { g: this, x: +m[1], y: +m[2], w: +r.getAttribute('width'), h: +r.getAttribute('height') };
        });
        $(svg).find('path[data-w]').each(function() {
            var ends = this.getAttribute('data-w').split('>').map(function(e) {
                var a = e.split(':'), c = a[1].split(',');
                return { n: a[0], x: +c[0], y: +c[1] };
            });
            wires.push({ p: this, a: ends[0], b: ends[1] });
        });

        function redraw() {
            wires.forEach(function(w) {
                var A = nodes[w.a.n] || { x: 0, y: 0 }, B = nodes[w.b.n];
                var x1 = A.x + w.a.x, y1 = A.y + w.a.y, x2 = B.x + w.b.x, y2 = B.y + w.b.y;
                if (w.b.n === 'out') y2 = y1; // the hero output wire leaves the screen straight
                var dx = Math.max(30, Math.abs(x2 - x1) / 2), c1x = x1 + dx, c1y = y1;
                if (w.a.n === 'fix') { c1x = x1; c1y = y1 + Math.max(40, (y2 - y1) / 2); }
                w.p.setAttribute('d', 'M' + x1 + ' ' + y1 + ' C' + c1x + ' ' + c1y + ' ' + (x2 - dx) + ' ' + y2 + ' ' + x2 + ' ' + y2);
            });
        }
        function toSvg(e) {
            var p = svg.createSVGPoint();
            p.x = e.clientX;
            p.y = e.clientY;
            return p.matrixTransform(svg.getScreenCTM().inverse());
        }
        // Frosted glass: a blurred panel sits behind each node and follows it. SVG cannot
        // blur what is behind it, so these are HTML panels under the svg.
        var section = $(svg).closest('.hero, .contact')[0], layer = $('<div class="frost-layer"></div>').prependTo(section)[0];
        $.each(nodes, function(name, n) {
            var r = n.g.querySelector('rect');
            if (n.w < 20) return; // invisible end nodes of off-screen wires
            n.frost = $('<div class="frost"></div>').appendTo(layer)[0];
            n.rx = +r.getAttribute('rx') || 0;
        });
        function syncFrost() {
            var sr = section.getBoundingClientRect();
            $.each(nodes, function(name, n) {
                if (!n.frost) return;
                var r = n.g.querySelector('rect').getBoundingClientRect();
                n.frost.style.cssText = 'left:' + (r.left - sr.left) + 'px;top:' + (r.top - sr.top) + 'px;width:' + r.width + 'px;height:' + r.height + 'px;border-radius:' + (n.rx * r.width / n.w) + 'px';
            });
        }
        // Wires and pins glow in their own colour.
        $(svg).find('path[data-w]').each(function() { this.style.setProperty('--w', this.getAttribute('stroke')); });
        $(svg).find('.node circle').each(function() { this.style.setProperty('--w', this.getAttribute('fill')); });
        redraw();
        syncFrost();
        $(window).on('load resize', syncFrost);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncFrost);

        $.each(nodes, function(name, n) {
            n.g.addEventListener('pointerdown', function(e) {
                if (e.button) return;
                var c = toSvg(e), sx = e.clientX, sy = e.clientY, ox = c.x - n.x, oy = c.y - n.y, moved = false;
                function move(ev) {
                    if (!moved && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 5) return;
                    if (!moved) { moved = true; svg.appendChild(n.g); n.g.classList.add('drag'); } // raise above the others
                    var p = toSvg(ev);
                    var minX = 0, minY = 0, maxX = vb.width, maxY = vb.height, area = $(svg).closest('.hero, .contact')[0];
                    if (area) { // nodes roam the whole section, below the fixed nav
                        var r = area.getBoundingClientRect();
                        var tl = toSvg({ clientX: r.left, clientY: Math.max(r.top, 68) }), br = toSvg({ clientX: r.right, clientY: r.bottom });
                        minX = tl.x; minY = tl.y; maxX = br.x; maxY = br.y;
                    }
                    n.x = Math.max(minX, Math.min(maxX - n.w, p.x - ox));
                    n.y = Math.max(minY, Math.min(maxY - n.h, p.y - oy));
                    n.g.setAttribute('transform', 'translate(' + n.x + ' ' + n.y + ')');
                    redraw();
                    syncFrost();
                }
                function up() {
                    window.removeEventListener('pointermove', move);
                    window.removeEventListener('pointerup', up);
                    window.removeEventListener('pointercancel', up);
                    n.g.classList.remove('drag');
                    if (moved) { // a drag that started on a link must not follow it
                        window.addEventListener('click', stop, true);
                        setTimeout(function() { window.removeEventListener('click', stop, true); }, 50);
                    }
                }
                function stop(ev) { ev.preventDefault(); ev.stopPropagation(); }
                window.addEventListener('pointermove', move);
                window.addEventListener('pointerup', up);
                window.addEventListener('pointercancel', up);
            });
        });
    });

    // Initialize WOW.js Scrolling Animations
    new WOW().init();

})(jQuery); // End of use strict
