import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/error/result.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/primary_button.dart';
import '../models/update_profile_request.dart';
import '../providers/profile_providers.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _name = TextEditingController();
  final _phone = TextEditingController();
  bool _loading = false;
  bool _initialized = false;

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _loading = true);
    final result = await ref.read(updateProfileProvider)(
      UpdateProfileRequest(
        name: _name.text.trim(),
        phone: _phone.text.trim(),
      ),
    );
    if (!mounted) return;
    setState(() => _loading = false);
    switch (result) {
      case Success():
        ref.invalidate(userProfileProvider);
        context.pop();
      case Error(:final failure):
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(failure.toString())),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(userProfileProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Edit Profile')),
      body: profile.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (user) {
          if (!_initialized) {
            _name.text = user.name;
            _phone.text = user.phone ?? '';
            _initialized = true;
          }
          return Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                AppTextField(controller: _name, label: 'Name'),
                const SizedBox(height: 16),
                AppTextField(
                  controller: _phone,
                  label: 'Phone',
                  keyboardType: TextInputType.phone,
                ),
                const Spacer(),
                PrimaryButton(
                  label: 'Save',
                  isLoading: _loading,
                  onPressed: _save,
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
