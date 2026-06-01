import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CountryCombobox } from './location-combobox';

describe('CountryCombobox', () => {
    it('renders the placeholder when nothing is selected', () => {
        render(<CountryCombobox value={null} onChange={() => {}} placeholder="Select country" />);
        expect(screen.getByText('Select country')).toBeInTheDocument();
    });

    it('opens, lazy-loads countries, filters by search, and selects one', async () => {
        const onChange = vi.fn();
        render(<CountryCombobox value={null} onChange={onChange} placeholder="Select country" />);

        // Open the popover
        fireEvent.click(screen.getByText('Select country'));

        // Countries lazy-load from country-state-city; wait for the search box
        const search = await screen.findByPlaceholderText(/search country/i);
        fireEvent.change(search, { target: { value: 'Iceland' } });

        // The filtered option appears
        const option = await screen.findByText('Iceland');
        fireEvent.click(option);

        // onChange fires with the selected country (flag + isoCode)
        await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
        const selected = onChange.mock.calls[0][0];
        expect(selected).toMatchObject({ name: 'Iceland', isoCode: 'IS' });
    });

    it('shows the selected country with its flag', () => {
        render(
            <CountryCombobox
                value={{ name: 'Japan', isoCode: 'JP', flag: '🇯🇵' }}
                onChange={() => {}}
            />
        );
        expect(screen.getByText('Japan')).toBeInTheDocument();
        expect(screen.getByText('🇯🇵')).toBeInTheDocument();
    });
});
