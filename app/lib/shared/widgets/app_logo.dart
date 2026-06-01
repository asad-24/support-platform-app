import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

class AppLogo extends StatelessWidget {
  const AppLogo({super.key, this.size = 76});

  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox.square(
      dimension: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            decoration: BoxDecoration(
              color: AppColors.paleGreen,
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          Positioned.fill(child: CustomPaint(painter: _DataMapPainter())),
          Icon(
            Icons.location_pin,
            size: size * 0.72,
            color: AppColors.deepGreen,
          ),
          Positioned(
            bottom: size * 0.18,
            child: Icon(
              Icons.menu_book_rounded,
              size: size * 0.28,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

class _DataMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.deepGreen.withValues(alpha: 0.16)
      ..strokeWidth = 1.2
      ..style = PaintingStyle.stroke;

    for (var i = 1; i < 4; i++) {
      final dx = size.width * i / 4;
      canvas.drawLine(Offset(dx, 8), Offset(dx, size.height - 8), paint);
      final dy = size.height * i / 4;
      canvas.drawLine(Offset(8, dy), Offset(size.width - 8, dy), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
