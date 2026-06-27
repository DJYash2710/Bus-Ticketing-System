import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/error/result.dart';
import '../../../shared/widgets/app_header.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../core/utils/password_validator.dart';
import '../models/change_password_request.dart';
import '../providers/profile_providers.dart';

class ChangePasswordScreen extends ConsumerStatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  ConsumerState<ChangePasswordScreen> createState() =>
      _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends ConsumerState<ChangePasswordScreen> {
  final _current = TextEditingController();
  final _newPassword = TextEditingController();
  final _confirm = TextEditingController();
  bool _loading = false;
  bool _obscure = true;

  @override
  void dispose() {
    _current.dispose();
    _newPassword.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_newPassword.text != _confirm.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('New passwords do not match')),
      );
      return;
    }
    final passwordError = validatePassword(_newPassword.text);
    if (passwordError != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(passwordError)),
      );
      return;
    }
    setState(() => _loading = true);
    final result = await ref.read(changePasswordProvider)(
      ChangePasswordRequest(
        currentPassword: _current.text,
        newPassword: _newPassword.text,
      ),
    );
    if (!mounted) return;
    setState(() => _loading = false);
    switch (result) {
      case Success():
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Password updated')),
        );
        context.pop();
      case Error(:final failure):
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$failure')),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppHeader(showBack: true, title: 'Change Password'),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            AppTextField(
              controller: _current,
              label: 'Current Password',
              hint: 'Password',
              obscureText: _obscure,
            ),
            const SizedBox(height: 16),
            AppTextField(
              controller: _newPassword,
              label: 'New Password',
              hint: 'Password',
              obscureText: _obscure,
            ),
            const SizedBox(height: 16),
            AppTextField(
              controller: _confirm,
              label: 'Confirm New Password',
              hint: 'Password',
              obscureText: _obscure,
            ),
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton(
                onPressed: () => setState(() => _obscure = !_obscure),
                child: Text(_obscure ? 'Show passwords' : 'Hide passwords'),
              ),
            ),
            const Spacer(),
            PrimaryButton(
              label: 'Update Password',
              isLoading: _loading,
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }
}
