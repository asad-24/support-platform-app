import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';
import 'models.dart';

class AddSiteFlowTimeline extends StatelessWidget {
  const AddSiteFlowTimeline({
    super.key,
    required this.currentStep,
    required this.steps,
  });

  final int currentStep;
  final List<FlowStepMeta> steps;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (var i = 0; i < steps.length; i++) ...[
            _AddSiteFlowTimelineNode(
              index: i,
              label: steps[i].title,
              isCurrent: i == currentStep,
              isComplete: i < currentStep,
            ),
            if (i < steps.length - 1)
              Container(
                width: 34,
                height: 2,
                margin: const EdgeInsets.only(bottom: 24),
                color: i < currentStep
                    ? AppColors.onboardingGreen
                    : AppColors.line,
              ),
          ],
        ],
      ),
    );
  }
}

class _AddSiteFlowTimelineNode extends StatelessWidget {
  const _AddSiteFlowTimelineNode({
    required this.index,
    required this.label,
    required this.isCurrent,
    required this.isComplete,
  });

  final int index;
  final String label;
  final bool isCurrent;
  final bool isComplete;

  @override
  Widget build(BuildContext context) {
    final active = isCurrent || isComplete;
    return SizedBox(
      width: 84,
      child: Column(
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 220),
            width: 34,
            height: 34,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: active ? AppColors.onboardingGreen : Colors.white,
              shape: BoxShape.circle,
              border: Border.all(
                color: active ? AppColors.onboardingGreen : AppColors.line,
                width: 2,
              ),
              boxShadow: active
                  ? [
                      BoxShadow(
                        color: AppColors.onboardingGreen.withValues(
                          alpha: 0.18,
                        ),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ]
                  : null,
            ),
            child: isComplete
                ? const Icon(Icons.check_rounded, color: Colors.white, size: 18)
                : Text(
                    '${index + 1}',
                    style: TextStyle(
                      color: active ? Colors.white : AppColors.muted,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: isCurrent ? AppColors.ink : AppColors.muted,
              fontSize: 12,
              fontWeight: isCurrent ? FontWeight.w800 : FontWeight.w600,
              height: 1.2,
            ),
          ),
        ],
      ),
    );
  }
}
