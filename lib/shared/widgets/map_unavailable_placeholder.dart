import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

class MapUnavailablePlaceholder extends StatelessWidget {
  const MapUnavailablePlaceholder({
    super.key,
    required this.message,
    this.title = 'Map preview unavailable',
    this.icon = Icons.map_outlined,
  });

  final String title;
  final String message;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.elevatedSurface(context),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 34, color: AppColors.deepGreen),
              const SizedBox(height: 12),
              Text(
                title,
                style: Theme.of(context).textTheme.titleMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 320),
                child: Text(
                  message,
                  style: TextStyle(
                    color: AppColors.secondaryText(context),
                    height: 1.35,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
