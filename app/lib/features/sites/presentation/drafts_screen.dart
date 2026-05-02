import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/storage/storage_providers.dart';
import '../../../core/utils/responsive.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/status_badge.dart';
import '../data/sites_repository.dart';

class DraftsScreen extends ConsumerWidget {
  const DraftsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final drafts = ref.watch(draftsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Draft records')),
      body: drafts.when(
        data: (items) {
          if (items.isEmpty) {
            return const EmptyState(
              icon: Icons.inventory_2_outlined,
              title: 'No local drafts',
              message:
                  'Saved drafts and interrupted field records will appear here.',
            );
          }
          return Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: Responsive.pageMaxWidth(context),
              ),
              child: ListView.separated(
                padding: Responsive.pagePadding(context),
                itemCount: items.length,
                separatorBuilder: (_, _) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final draft = items[index];
                  return Card(
                    child: ListTile(
                      leading: const Icon(
                        Icons.description_outlined,
                        color: AppColors.deepGreen,
                      ),
                      title: Text(draft.displayName),
                      subtitle: Text(
                        'Updated ${DateFormat.yMMMd().add_jm().format(draft.updatedAt)}',
                      ),
                      trailing: Wrap(
                        spacing: 8,
                        children: [
                          StatusBadge.urgency(draft.urgency),
                          IconButton(
                            tooltip: 'Delete draft',
                            onPressed: () async {
                              await ref
                                  .read(localDraftStorageProvider)
                                  .delete(draft.id);
                              ref.invalidate(draftsProvider);
                            },
                            icon: const Icon(Icons.delete_outline_rounded),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text(error.toString())),
      ),
    );
  }
}
