import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  linkedSignal,
  model,
  input,
  output,
  signal,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Icon } from '@lumvir/web-components/icon';

/** Primitive values supported by the native select binding. */
export type SelectOptionValue = string | number | boolean | null;

export interface SelectOption {
  label: string;
  value: SelectOptionValue;
  disabled?: boolean;
}

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectVariant = 'outlined' | 'filled';

let nextSelectId = 0;

/**
 * Reusable select with left/right icons, sizes, clear, loading, and CVA support.
 * Uses the CSS token contract (no brand colours). Keeps GC a11y minimums: 44 px / 16 px.
 */
@Component({
  selector: 'ui-select',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select),
      multi: true,
    },
  ],
  host: {
    class: 'inline-flex max-w-full',
    '[class.w-full]': 'fluid()',
    '[attr.data-size]': 'size()',
    '[attr.data-invalid]': 'invalid() || null',
    '[attr.data-disabled]': 'isDisabled() || null',
  },
  templateUrl: './select.html',
})
export class Select implements ControlValueAccessor {
  private readonly generatedId = `ui-select-${++nextSelectId}`;

  readonly options = input<readonly unknown[]>([]);
  readonly optionLabel = input('label');
  readonly optionValue = input('value');
  readonly optionDisabled = input('disabled');

  /** Two-way value (`model`). */
  readonly value = model<SelectOptionValue>(null);
  readonly placeholder = input<string | undefined>(undefined);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly invalid = input(false);
  readonly loading = input(false);
  readonly showClear = input(false);
  readonly clearLabel = input('Clear selection');
  readonly fluid = input(false);
  readonly size = input<SelectSize>('md');
  readonly variant = input<SelectVariant>('outlined');

  readonly leftIcon = input<string | undefined>(undefined);
  readonly leftIconClass = input('text-ink-muted');
  readonly rightIcon = input<string | ''>('chevron-down');
  readonly rightIconClass = input('text-ink-muted');

  readonly inputId = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly ariaDescribedBy = input<string | undefined>(undefined);
  readonly styleClass = input('');

  /** Extra change event (in addition to the `value` model's `valueChange`). */
  readonly changed = output<SelectOptionValue>();
  readonly cleared = output<void>();
  readonly focused = output<FocusEvent>();
  readonly blurred = output<FocusEvent>();

  private readonly cvaDisabled = signal(false);
  private onChange: (value: SelectOptionValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected readonly currentValue = linkedSignal<SelectOptionValue>(() => this.value());
  protected readonly selectId = computed(() => this.inputId() ?? this.generatedId);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled() || this.loading(),
  );

  protected readonly normalizedOptions = computed((): SelectOption[] => {
    const labelKey = this.optionLabel();
    const valueKey = this.optionValue();
    const disabledKey = this.optionDisabled();

    return this.options().map((option) => {
      if (option !== null && typeof option === 'object') {
        const record = option as Record<string, unknown>;
        return {
          label: String(record[labelKey] ?? ''),
          value: (record[valueKey] ?? null) as SelectOptionValue,
          disabled: Boolean(record[disabledKey]),
        };
      }
      return {
        label: String(option),
        value: option as SelectOptionValue,
        disabled: false,
      };
    });
  });

  protected readonly hasValue = computed(() => {
    const value = this.currentValue();
    return value !== null && value !== undefined && value !== '';
  });

  protected readonly canClear = computed(
    () => this.showClear() && this.hasValue() && !this.isDisabled() && !this.readonly(),
  );

  protected readonly showRightIcon = computed(
    () => Boolean(this.rightIcon()) && !this.canClear() && !this.loading(),
  );

  protected readonly leftIconOffsetClass = computed(() => {
    const size = this.size();
    return size === 'sm' ? 'left-2.5' : size === 'lg' ? 'left-3.5' : 'left-3';
  });

  protected readonly wrapperClass = computed(() => {
    const size = this.size();
    const variant = this.variant();
    const invalid = this.invalid();
    const disabled = this.isDisabled();

    const sizeClasses = size === 'lg' ? 'text-[18px]' : 'text-[16px]';
    const variantClasses =
      variant === 'filled' ? 'border-line bg-surface' : 'border-line bg-canvas';
    const stateClasses = invalid
      ? 'border-ink focus-within:border-ink focus-within:ring-ink/40'
      : 'focus-within:border-focus focus-within:ring-focus';
    const disabledClasses = disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer';

    return [
      'relative inline-flex w-full min-w-0 items-center rounded-md border',
      'focus-within:outline-none focus-within:ring-2',
      sizeClasses,
      variantClasses,
      stateClasses,
      disabledClasses,
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' ');
  });

  protected readonly selectClass = computed(() => {
    const size = this.size();
    const hasLeft = Boolean(this.leftIcon());
    const hasRight = this.canClear() || this.showRightIcon() || this.loading();

    const padY = size === 'sm' ? 'py-1.5' : size === 'lg' ? 'py-3' : 'py-2.5';
    const padLeft = hasLeft
      ? size === 'sm'
        ? 'pl-8'
        : size === 'lg'
          ? 'pl-10'
          : 'pl-9'
      : size === 'sm'
        ? 'pl-2.5'
        : size === 'lg'
          ? 'pl-3.5'
          : 'pl-3';
    const padRight = hasRight
      ? size === 'sm'
        ? 'pr-7'
        : 'pr-8'
      : size === 'sm'
        ? 'pr-2.5'
        : 'pr-3';

    return [
      'min-h-11 w-full min-w-0 appearance-none border-0 bg-transparent text-ink',
      'focus:outline-none focus:ring-0',
      this.isDisabled() ? 'cursor-not-allowed' : 'cursor-pointer',
      this.readonly() ? 'pointer-events-none' : '',
      padY,
      padLeft,
      padRight,
    ]
      .filter(Boolean)
      .join(' ');
  });

  writeValue(value: SelectOptionValue): void {
    this.currentValue.set(value ?? null);
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: SelectOptionValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected stringValue(value: SelectOptionValue): string {
    if (value === null || value === undefined) return '';
    return String(value);
  }

  protected onSelectChange(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    const matched = this.normalizedOptions().find(
      (option) => this.stringValue(option.value) === raw,
    );
    const next: SelectOptionValue = raw === '' ? null : (matched?.value ?? raw);
    this.commit(next);
  }

  protected onClear(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.commit(null);
    this.cleared.emit();
  }

  protected onFocus(event: FocusEvent): void {
    this.focused.emit(event);
  }

  protected onBlur(event: FocusEvent): void {
    this.onTouched();
    this.blurred.emit(event);
  }

  private commit(value: SelectOptionValue): void {
    this.currentValue.set(value);
    this.value.set(value);
    this.onChange(value);
    this.changed.emit(value);
  }
}
