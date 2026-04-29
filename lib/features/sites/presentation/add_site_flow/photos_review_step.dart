import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../shared/models/app_enums.dart';
import 'models.dart';
import 'shared_widgets.dart';

class PhotosReviewStep extends StatelessWidget {
  const PhotosReviewStep({
    super.key,
    required this.photos,
    required this.minPhotos,
    required this.maxPhotos,
    required this.onCapturePhoto,
    required this.onSelectFromGallery,
    required this.onPhotoCategoryChanged,
    required this.onRemovePhoto,
  });

  final List<SitePhotoDraft> photos;
  final int minPhotos;
  final int maxPhotos;
  final VoidCallback onCapturePhoto;
  final VoidCallback onSelectFromGallery;
  final void Function(SitePhotoDraft photo, MediaType? category)
  onPhotoCategoryChanged;
  final ValueChanged<SitePhotoDraft> onRemovePhoto;

  bool get _canAddPhoto => photos.length < maxPhotos;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AddSiteFormSectionHeader(
          title: 'Photo Documentation',
          description:
              'Upload clear photos of the school environment. Minimum $minPhotos and maximum $maxPhotos photos.',
        ),
        AddSiteResponsiveButtonRow(
          children: [
            OutlinedButton.icon(
              onPressed: _canAddPhoto ? onCapturePhoto : null,
              icon: const Icon(Icons.camera_alt_rounded),
              label: const Text('Take Photo'),
            ),
            OutlinedButton.icon(
              onPressed: _canAddPhoto ? onSelectFromGallery : null,
              icon: const Icon(Icons.photo_library_rounded),
              label: const Text('From Gallery'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        const AddSiteFormSectionHeader(
          title: 'Photo Categories',
          description:
              'Assign a category to each photo for proper documentation.',
        ),
        if (photos.isEmpty)
          const Padding(
            padding: EdgeInsets.only(bottom: 14),
            child: Text(
              'No photos selected yet.',
              style: TextStyle(color: AppColors.muted),
            ),
          )
        else
          ...photos.indexed.map(
            (entry) => _PhotoDocumentationCard(
              index: entry.$1,
              photo: entry.$2,
              onCategoryChanged: (category) =>
                  onPhotoCategoryChanged(entry.$2, category),
              onRemove: () => onRemovePhoto(entry.$2),
            ),
          ),
        _SafeguardingPhotoNotice(),
      ],
    );
  }
}

class _PhotoDocumentationCard extends StatelessWidget {
  const _PhotoDocumentationCard({
    required this.index,
    required this.photo,
    required this.onCategoryChanged,
    required this.onRemove,
  });

  final int index;
  final SitePhotoDraft photo;
  final ValueChanged<MediaType?> onCategoryChanged;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _PhotoPreview(photo: photo),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Photo ${index + 1}',
                      style: const TextStyle(
                        color: AppColors.ink,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      photo.file.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                tooltip: 'Remove photo',
                onPressed: onRemove,
                icon: const Icon(Icons.close_rounded),
              ),
            ],
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<MediaType>(
            isExpanded: true,
            menuMaxHeight: MediaQuery.sizeOf(context).height * 0.46,
            initialValue: photo.category,
            decoration: const InputDecoration(
              labelText: 'Photo category',
              prefixIcon: Icon(Icons.category_outlined),
            ),
            items: _photoCategories
                .map(
                  (category) => DropdownMenuItem<MediaType>(
                    value: category,
                    child: Text(
                      _categoryLabel(category),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                )
                .toList(),
            onChanged: onCategoryChanged,
            validator: (category) {
              if (category == null) {
                return 'Select a category for this photo';
              }
              return null;
            },
          ),
        ],
      ),
    );
  }
}

class _PhotoPreview extends StatelessWidget {
  const _PhotoPreview({required this.photo});

  final SitePhotoDraft photo;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: SizedBox(
        width: 78,
        height: 78,
        child: FutureBuilder<Uint8List>(
          future: photo.file.readAsBytes(),
          builder: (context, snapshot) {
            if (snapshot.hasData) {
              return Image.memory(snapshot.data!, fit: BoxFit.cover);
            }
            return Container(
              color: AppColors.paleGreen,
              alignment: Alignment.center,
              child: const Icon(
                Icons.image_rounded,
                color: AppColors.deepGreen,
              ),
            );
          },
        ),
      ),
    );
  }
}

class _SafeguardingPhotoNotice extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 2),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.paleGreen,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.line),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_outline_rounded, color: AppColors.deepGreen),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              'Photos are stored securely and used only for welfare documentation. Avoid children faces where possible.',
              style: TextStyle(
                color: AppColors.ink,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

const _photoCategories = [
  MediaType.entrance,
  MediaType.classArea,
  MediaType.sleepingArea,
  MediaType.sanitation,
  MediaType.environment,
  MediaType.other,
];

String _categoryLabel(MediaType category) {
  return switch (category) {
    MediaType.environment => 'General environment',
    _ => category.label,
  };
}
