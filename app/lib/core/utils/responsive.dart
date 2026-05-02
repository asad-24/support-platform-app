import 'package:flutter/widgets.dart';

class Responsive {
  const Responsive._();

  static double pageMaxWidth(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    return width >= 900 ? 980 : width;
  }

  static EdgeInsets pagePadding(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    return EdgeInsets.symmetric(
      horizontal: width >= 700 ? 32 : 16,
      vertical: 16,
    );
  }
}
