import { useId, type SelectHTMLAttributes } from 'react';
import { Icon } from './Icon';
import { FieldError, FieldHint, FieldLabel, fieldBoxClass, type FieldChrome } from './TextField';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldChrome {
  options: string[];
  placeholder: string;
}

export function SelectField({
  label,
  icon,
  error,
  hint,
  labelAction,
  labelStyle = 'plain',
  tone = 'white',
  options,
  placeholder,
  id,
  className = '',
  ...selectProps
}: SelectFieldProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const errorId = `${selectId}-error`;
  const hintId = `${selectId}-hint`;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <FieldLabel htmlFor={selectId} label={label} labelStyle={labelStyle} action={labelAction} />
      <div className={`relative flex items-center rounded-control transition-colors ${fieldBoxClass(tone, !!error)}`}>
        {icon && (
          <Icon
            name={icon}
            className={`pointer-events-none absolute left-3.5 text-[20px] ${error ? 'text-wine' : 'text-on-surface-variant'}`}
          />
        )}
        <select
          id={selectId}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`h-field w-full cursor-pointer appearance-none rounded-control bg-transparent pr-10 text-body-md focus:outline-none disabled:cursor-wait disabled:opacity-60 ${icon ? 'pl-11' : 'pl-4'} ${selectProps.value ? 'text-on-surface' : 'text-muted'}`}
          {...selectProps}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o} className="text-on-surface">
              {o}
            </option>
          ))}
        </select>
        <Icon name="expand_more" className="pointer-events-none absolute right-3.5 text-[22px] text-on-surface-variant" />
      </div>
      {error ? <FieldError id={errorId} error={error} /> : <FieldHint id={hintId} hint={hint} />}
    </div>
  );
}
