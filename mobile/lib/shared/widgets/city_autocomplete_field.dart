import 'package:flutter/material.dart';

import '../../core/utils/debounce.dart';
import '../../features/search/models/city.dart';
import '../../features/search/services/cities_api_service.dart';

class CityAutocompleteField extends StatefulWidget {
  const CityAutocompleteField({
    required this.label,
    required this.icon,
    required this.api,
    required this.onChanged,
    this.value,
    super.key,
  });

  final String label;
  final IconData icon;
  final CitiesApiService api;
  final City? value;
  final ValueChanged<City?> onChanged;

  @override
  State<CityAutocompleteField> createState() => _CityAutocompleteFieldState();
}

class _CityAutocompleteFieldState extends State<CityAutocompleteField> {
  final _controller = TextEditingController();
  final _debouncer = Debouncer();
  List<City> _options = [];
  bool _loading = false;
  bool _showDropdown = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _syncFromValue();
    _loadOptions('');
  }

  @override
  void didUpdateWidget(covariant CityAutocompleteField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value?.id != widget.value?.id) {
      _syncFromValue();
    }
  }

  void _syncFromValue() {
    final name = widget.value?.name ?? '';
    if (_controller.text != name) {
      _controller.text = name;
    }
  }

  Future<void> _loadOptions(String query) async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });
    try {
      final cities = await widget.api.list(search: query.isEmpty ? null : query);
      if (!mounted) return;
      setState(() {
        _options = cities;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _errorMessage = 'Could not load cities. Check your connection.';
      });
    }
  }

  void _onQueryChanged(String query) {
    widget.onChanged(null);
    setState(() => _showDropdown = true);
    _debouncer.call(() => _loadOptions(query));
  }

  void _select(City city) {
    _controller.text = city.name;
    widget.onChanged(city);
    setState(() => _showDropdown = false);
    FocusScope.of(context).unfocus();
  }

  @override
  void dispose() {
    _debouncer.dispose();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextFormField(
          controller: _controller,
          decoration: InputDecoration(
            labelText: widget.label,
            hintText: 'Type city name',
            prefixIcon: Icon(widget.icon),
            suffixIcon: _loading
                ? const Padding(
                    padding: EdgeInsets.all(12),
                    child: SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                : null,
          ),
          onTap: () {
            setState(() => _showDropdown = true);
            _loadOptions(_controller.text);
          },
          onChanged: _onQueryChanged,
        ),
        if (_errorMessage != null)
          Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Text(
              _errorMessage!,
              style: TextStyle(color: Theme.of(context).colorScheme.error, fontSize: 12),
            ),
          ),
        if (_showDropdown && _options.isNotEmpty)
          Card(
            margin: const EdgeInsets.only(top: 4),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 200),
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: _options.length,
                itemBuilder: (context, i) {
                  final city = _options[i];
                  return ListTile(
                    dense: true,
                    title: Text(city.name),
                    subtitle: city.state != null ? Text(city.state!) : null,
                    onTap: () => _select(city),
                  );
                },
              ),
            ),
          ),
      ],
    );
  }
}
