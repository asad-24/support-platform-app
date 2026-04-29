import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:school_support_atlas/core/constants/app_constants.dart';
import 'package:school_support_atlas/shared/widgets/app_logo.dart';

void main() {
  testWidgets('renders Support Atlas brand elements', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Column(children: [AppLogo(), Text(AppConstants.appName)]),
        ),
      ),
    );

    expect(find.byType(AppLogo), findsOneWidget);
    expect(find.text(AppConstants.appName), findsOneWidget);
  });
}
