'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { showError } from '@/lib/toast-helper';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { CountryCombobox, CityCombobox, CountryData } from '@/components/ui/location-combobox';
import { useCreateTrip } from '@/hooks/use-trips';

// ─── Step config ────────────────────────────────────────────────────────────

const STEPS = ['name', 'destination', 'dates', 'description'] as const;
type StepId = typeof STEPS[number];

interface StepMeta {
    headline: string;
    sub?: string;
    skippable: boolean;
    isLast?: boolean;
}

const STEP_META: Record<StepId, StepMeta> = {
    name: {
        headline: 'What shall we call\nthis trip?',
        skippable: false,
    },
    destination: {
        headline: 'Where are you\nheaded?',
        sub: 'You can always update this later.',
        skippable: true,
    },
    dates: {
        headline: 'When are you going?',
        sub: "Not sure yet? No worries — skip for now.",
        skippable: true,
    },
    description: {
        headline: 'Anything to add?',
        sub: 'A theme, goal, or quick note about the trip.',
        skippable: true,
        isLast: true,
    },
};

// ─── Framer variants ─────────────────────────────────────────────────────────

const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 52 : -52, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -52 : 52, opacity: 0 }),
};
const slideTransition = { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const };

// ─── Component ───────────────────────────────────────────────────────────────

interface CreateTripDialogProps {
    triggerContent?: React.ReactNode;
}

export function CreateTripDialog({ triggerContent }: CreateTripDialogProps = {}) {
    const [open, setOpen] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [direction, setDirection] = useState(1);

    // Form values
    const [name, setName] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
    const [selectedCity, setSelectedCity] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [description, setDescription] = useState('');

    const nameInputRef = useRef<HTMLInputElement>(null);
    const { mutate: createTrip, isPending } = useCreateTrip();

    const step = STEPS[stepIndex];
    const meta = STEP_META[step];
    const progress = ((stepIndex + 1) / STEPS.length) * 100;
    const canContinue = step === 'name' ? name.trim().length > 0 : true;

    // ── Navigation ────────────────────────────────────────────────────────

    const goNext = () => {
        if (stepIndex < STEPS.length - 1) {
            setDirection(1);
            setStepIndex((i) => i + 1);
        } else {
            submit();
        }
    };

    const goBack = () => {
        if (stepIndex > 0) {
            setDirection(-1);
            setStepIndex((i) => i - 1);
        }
    };

    const skipStep = () => {
        // Clear optional data for the step being skipped
        if (step === 'destination') {
            setSelectedCountry(null);
            setSelectedCity('');
        } else if (step === 'dates') {
            setStartDate(undefined);
            setEndDate(undefined);
        } else if (step === 'description') {
            setDescription('');
        }
        goNext();
    };

    // ── Submit ────────────────────────────────────────────────────────────

    const submit = () => {
        if (!name.trim()) return;
        createTrip(
            {
                name: name.trim(),
                description: description.trim() || undefined,
                primaryDestinationCountry: selectedCountry?.name,
                primaryDestinationCity: selectedCity || undefined,
                startDateTimestamp: startDate ? Math.floor(startDate.getTime() / 1000) : undefined,
                endDateTimestamp: endDate ? Math.floor(endDate.getTime() / 1000) : undefined,
            },
            {
                onSuccess: () => {
                    setOpen(false);
                    resetForm();
                    toast.success('Trip created!');
                },
                onError: (err: unknown) => {
                    showError('Failed to create trip', err);
                },
            }
        );
    };

    // ── Helpers ───────────────────────────────────────────────────────────

    const resetForm = () => {
        setStepIndex(0);
        setDirection(1);
        setName('');
        setSelectedCountry(null);
        setSelectedCity('');
        setStartDate(undefined);
        setEndDate(undefined);
        setDescription('');
    };

    const handleOpenChange = (v: boolean) => {
        setOpen(v);
        if (!v) resetForm();
    };

    // Auto-focus name input when step 0 opens
    useEffect(() => {
        if (open && step === 'name') {
            const t = setTimeout(() => nameInputRef.current?.focus(), 160);
            return () => clearTimeout(t);
        }
    }, [open, step]);

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {triggerContent ?? (
                    <Button size="lg" className="shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                        <Plus className="mr-2 h-5 w-5" />
                        Create New Trip
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[480px] gap-0 p-0 overflow-hidden rounded-2xl">

                {/* Visually hidden title for screen-reader accessibility */}
                <DialogTitle className="sr-only">Create New Trip</DialogTitle>

                {/* ── Progress bar ── */}
                <div className="h-[3px] w-full bg-border/50">
                    <motion.div
                        className="h-full bg-primary origin-left"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.38, ease: 'easeOut' }}
                    />
                </div>

                {/* ── Top nav (back / step counter / skip) ── */}
                <div className="flex items-center justify-between px-6 pt-4">
                    <button
                        type="button"
                        onClick={goBack}
                        className={cn(
                            'flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors',
                            stepIndex === 0 && 'invisible pointer-events-none'
                        )}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>

                    <span className="text-xs text-muted-foreground font-medium tabular-nums">
                        {stepIndex + 1} / {STEPS.length}
                    </span>

                    {meta.skippable ? (
                        <button
                            type="button"
                            onClick={skipStep}
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Skip
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    ) : (
                        <span className="w-12" />
                    )}
                </div>

                {/* ── Animated step body ── */}
                <div className="overflow-hidden px-6 pt-7 pb-4 min-h-[268px] flex flex-col justify-start">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={slideTransition}
                            className="flex flex-col gap-5"
                        >
                            {/* Headline */}
                            <div className="space-y-1">
                                <h2 className="text-[1.65rem] font-semibold tracking-tight leading-snug whitespace-pre-line">
                                    {meta.headline}
                                </h2>
                                {meta.sub && (
                                    <p className="text-sm text-muted-foreground">{meta.sub}</p>
                                )}
                            </div>

                            {/* ── Step: Name ── */}
                            {step === 'name' && (
                                <Input
                                    ref={nameInputRef}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Icelandic Road Trip"
                                    className="rounded-xl h-12 text-base"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && canContinue) goNext();
                                    }}
                                />
                            )}

                            {/* ── Step: Destination ── */}
                            {step === 'destination' && (
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Country</label>
                                        <CountryCombobox
                                            value={selectedCountry}
                                            onChange={(c) => {
                                                setSelectedCountry(c);
                                                setSelectedCity('');
                                            }}
                                            placeholder="Select country"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm text-muted-foreground font-medium">
                                            City{' '}
                                            <span className="font-normal">(optional)</span>
                                        </label>
                                        <CityCombobox
                                            value={selectedCity}
                                            onChange={setSelectedCity}
                                            countryCode={selectedCountry?.isoCode ?? ''}
                                            disabled={!selectedCountry}
                                        />
                                    </div>

                                    {/* Preview chip */}
                                    <AnimatePresence>
                                        {(selectedCountry || selectedCity) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                                                transition={{ duration: 0.18 }}
                                                className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2"
                                            >
                                                {selectedCountry && (
                                                    <span className="text-base leading-none">
                                                        {selectedCountry.flag}
                                                    </span>
                                                )}
                                                <span className="text-sm font-medium text-primary">
                                                    {[selectedCountry?.name, selectedCity]
                                                        .filter(Boolean)
                                                        .join(' · ')}
                                                </span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* ── Step: Dates ── */}
                            {step === 'dates' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Start</label>
                                        <DatePicker
                                            date={startDate}
                                            setDate={setStartDate}
                                            placeholder="Start Date"
                                            disabled={(d) =>
                                                d < new Date(new Date().setHours(0, 0, 0, 0))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">End</label>
                                        <DatePicker
                                            date={endDate}
                                            setDate={setEndDate}
                                            placeholder="End Date"
                                            disabled={(d) => {
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                if (d < today) return true;
                                                if (startDate && d < startDate) return true;
                                                return false;
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ── Step: Description ── */}
                            {step === 'description' && (
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What's this trip about? Any goals, themes, or highlights…"
                                    className="rounded-xl resize-none min-h-[108px]"
                                    autoFocus
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* ── Continue / Create button ── */}
                <div className="px-6 pb-6 pt-2">
                    <Button
                        onClick={goNext}
                        disabled={!canContinue || isPending}
                        className="w-full h-11 text-base gap-2"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : meta.isLast ? (
                            <>
                                Create Trip
                                <ArrowRight className="h-4 w-4" />
                            </>
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
