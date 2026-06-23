/// Common async-value helpers for feature providers.
mixin AsyncValueMixin<T> {
  Future<T> runGuarded(Future<T> Function() action) => action();
}
