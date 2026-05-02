import 'dart:convert';

import 'package:flutter/services.dart';

import 'models.dart';

class NigeriaLocationsService {
  static const _assetPath = 'assets/data/nigeria_states_lgas.json';

  Future<List<NigeriaStateOption>> fetchStatesAndLgas() async {
    final rawJson = await rootBundle.loadString(_assetPath);
    final rawList = jsonDecode(rawJson) as List<dynamic>;

    final states =
        rawList
            .map(
              (item) => NigeriaStateOption.fromJson(
                Map<String, dynamic>.from(item as Map),
              ),
            )
            .where((item) => item.name.trim().isNotEmpty)
            .toList()
          ..sort((a, b) => a.name.compareTo(b.name));

    return states;
  }
}
