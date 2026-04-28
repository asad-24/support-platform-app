import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../models/site.dart';
import 'status_badge.dart';

class SiteCard extends StatelessWidget {
  const SiteCard({super.key, required this.site, this.onTap});

  final Site site;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          site.name,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${site.uniqueSiteId} • ${site.community}, ${site.lga}',
                          style: const TextStyle(color: AppColors.muted),
                        ),
                      ],
                    ),
                  ),
                  const Icon(
                    Icons.chevron_right_rounded,
                    color: AppColors.muted,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  StatusBadge.verification(site.verificationStatus),
                  StatusBadge.urgency(site.urgencyLevel),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
