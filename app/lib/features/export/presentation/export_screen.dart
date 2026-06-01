import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../sites/data/sites_repository.dart';

class ExportScreen extends ConsumerStatefulWidget {
  const ExportScreen({super.key});

  @override
  ConsumerState<ExportScreen> createState() => _ExportScreenState();
}

class _ExportScreenState extends ConsumerState<ExportScreen> {
  String? _csv;
  bool _loading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Export data')),
      body: Center(
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxWidth: Responsive.pageMaxWidth(context),
          ),
          child: ListView(
            padding: Responsive.pagePadding(context),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Sites CSV',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Exports aggregate site data for admin review. Safeguarding notes should only be handled through protected backend reports.',
                        style: TextStyle(
                          color: AppColors.secondaryText(context),
                        ),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: _loading ? null : _loadCsv,
                        icon: _loading
                            ? const SizedBox.square(
                                dimension: 18,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.download_rounded),
                        label: const Text('Generate CSV'),
                      ),
                    ],
                  ),
                ),
              ),
              if (_csv != null) ...[
                const SizedBox(height: 16),
                SelectableText(
                  _csv!,
                  style: TextStyle(
                    fontFamily: 'monospace',
                    color: AppColors.primaryText(context),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _loadCsv() async {
    setState(() => _loading = true);
    try {
      final csv = await ref.read(sitesRepositoryProvider).exportSitesCsv();
      setState(() => _csv = csv);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }
}
