import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';

class AddSiteFormSectionHeader extends StatelessWidget {
  const AddSiteFormSectionHeader({
    super.key,
    required this.title,
    required this.description,
  });

  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(14),
      decoration: _softGradientDecoration(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: AppColors.deepGreen,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            description,
            style: TextStyle(
              color: AppColors.secondaryText(context),
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class AddSiteSectionHeaderWithAction extends StatelessWidget {
  const AddSiteSectionHeaderWithAction({
    super.key,
    required this.title,
    required this.description,
    required this.actionLabel,
    required this.onPressed,
  });

  final String title;
  final String description;
  final String actionLabel;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxWidth < 420;
        final titleBlock = Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: AppColors.deepGreen,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              description,
              style: TextStyle(
                color: AppColors.secondaryText(context),
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        );

        final action = OutlinedButton.icon(
          onPressed: onPressed,
          icon: const Icon(Icons.add_rounded),
          label: Text(actionLabel),
        );

        return Container(
          margin: const EdgeInsets.only(bottom: 14),
          padding: const EdgeInsets.all(14),
          decoration: _softGradientDecoration(context),
          child: compact
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [titleBlock, const SizedBox(height: 12), action],
                )
              : Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: titleBlock),
                    const SizedBox(width: 12),
                    ConstrainedBox(
                      constraints: const BoxConstraints(minWidth: 0),
                      child: action,
                    ),
                  ],
                ),
        );
      },
    );
  }
}

class AddSiteResponsiveActions extends StatelessWidget {
  const AddSiteResponsiveActions({
    super.key,
    this.secondary,
    required this.primary,
    this.spacing = 10,
  });

  final Widget? secondary;
  final Widget primary;
  final double spacing;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxWidth < 420;
        if (secondary == null) {
          return SizedBox(width: double.infinity, child: primary);
        }
        if (compact) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              primary,
              SizedBox(height: spacing),
              secondary!,
            ],
          );
        }
        return Row(
          children: [
            Expanded(child: secondary!),
            SizedBox(width: spacing),
            Expanded(child: primary),
          ],
        );
      },
    );
  }
}

class AddSiteResponsiveButtonRow extends StatelessWidget {
  const AddSiteResponsiveButtonRow({
    super.key,
    required this.children,
    this.spacing = 10,
  });

  final List<Widget> children;
  final double spacing;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxWidth < 420;
        if (compact) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (var i = 0; i < children.length; i++) ...[
                children[i],
                if (i < children.length - 1) SizedBox(height: spacing),
              ],
            ],
          );
        }
        return Row(
          children: [
            for (var i = 0; i < children.length; i++) ...[
              Expanded(child: children[i]),
              if (i < children.length - 1) SizedBox(width: spacing),
            ],
          ],
        );
      },
    );
  }
}

class AddSiteStepHeader extends StatelessWidget {
  const AddSiteStepHeader({
    super.key,
    required this.stepNumber,
    required this.totalSteps,
    required this.title,
    required this.subtitle,
  });

  final int stepNumber;
  final int totalSteps;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: AppColors.isDark(context)
              ? [
                  AppColors.elevatedSurface(context),
                  AppColors.greenTint(context),
                ]
              : [Colors.white, AppColors.paleGreen.withValues(alpha: 0.74)],
        ),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border(context)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Step $stepNumber of $totalSteps',
            style: const TextStyle(
              color: AppColors.onboardingGreen,
              fontSize: 12,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.2,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            title,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              color: AppColors.deepGreen,
              fontSize: 24,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            style: TextStyle(
              color: AppColors.secondaryText(context),
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class AddSiteStepCard extends StatelessWidget {
  const AddSiteStepCard({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: AppColors.isDark(context)
              ? [AppColors.elevatedSurface(context), AppColors.surface(context)]
              : const [Colors.white, Color(0xFFFBFDFC)],
        ),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border(context)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(
              alpha: AppColors.isDark(context) ? 0.18 : 0.05,
            ),
            blurRadius: 22,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Padding(padding: const EdgeInsets.all(14), child: child),
    );
  }
}

class AddSiteReviewRow extends StatelessWidget {
  const AddSiteReviewRow(this.label, this.value, {super.key});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxWidth < 360;
        final labelWidget = Text(
          label,
          style: TextStyle(
            color: AppColors.secondaryText(context),
            fontWeight: FontWeight.w700,
          ),
        );
        final valueWidget = Text(value.isEmpty ? 'Not provided' : value);

        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: compact
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    labelWidget,
                    const SizedBox(height: 2),
                    valueWidget,
                  ],
                )
              : Row(
                  children: [
                    SizedBox(width: 110, child: labelWidget),
                    Expanded(child: valueWidget),
                  ],
                ),
        );
      },
    );
  }
}

BoxDecoration _softGradientDecoration(BuildContext context) {
  return BoxDecoration(
    gradient: LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: AppColors.isDark(context)
          ? [AppColors.elevatedSurface(context), AppColors.greenTint(context)]
          : [
              AppColors.paleGreen,
              AppColors.onboardingGreen.withValues(alpha: 0.08),
            ],
    ),
    borderRadius: BorderRadius.circular(8),
    border: Border.all(color: AppColors.border(context)),
    boxShadow: [
      BoxShadow(
        color: AppColors.deepGreen.withValues(alpha: 0.06),
        blurRadius: 18,
        offset: const Offset(0, 8),
      ),
    ],
  );
}
