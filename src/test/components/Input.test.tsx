import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '@/components/ui/Input';

describe('Input component', () => {
  it('renders with label', () => {
    render(<Input label="Nome" placeholder="Digite seu nome" />);
    expect(screen.getByText('Nome')).toBeInTheDocument();
  });

  it('accepts user input', async () => {
    const user = userEvent.setup();
    render(<Input label="Teste" placeholder="Test" />);
    const input = screen.getByPlaceholderText('Test');
    await user.type(input, 'Olá Mundo');
    expect(input).toHaveValue('Olá Mundo');
  });

  it('renders disabled state', () => {
    render(<Input label="Desabilitado" disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });
});
