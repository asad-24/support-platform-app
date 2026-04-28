import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'local_draft_storage.dart';
import 'secure_token_storage.dart';

final secureTokenStorageProvider = Provider<SecureTokenStorage>((ref) {
  return SecureTokenStorage(const FlutterSecureStorage());
});

final localDraftStorageProvider = Provider<LocalDraftStorage>((ref) {
  return LocalDraftStorage();
});
