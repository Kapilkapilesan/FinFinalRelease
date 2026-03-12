
import React, { useMemo } from 'react';
import { colors } from '@/themes/colors';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { ChevronDown, Calendar, Filter } from 'lucide-react';

interface BranchOption {
    id: number;
    branch_name: string;
}

interface CenterOption {
    id: number;
    center_name: string;
}

interface GroupOption {
    id: number;
    group_name: string;
}

export type DateMode = 'today' | 'week' | 'all';

interface CollectionFiltersProps {
    branches: BranchOption[];
    centers: CenterOption[];
    groups?: GroupOption[];
    selectedBranch: string;
    selectedCenter: string;
    selectedGroup?: string;
    onBranchChange: (branchId: string) => void;
    onCenterChange: (centerId: string) => void;
    onGroupChange?: (groupId: string) => void;
    selectedDate: string;
    onDateChange: (date: string) => void;
    dateMode?: DateMode;
    onDateModeChange?: (mode: DateMode) => void;
}

export function CollectionFilters({
    branches,
    centers,
    groups = [],
    selectedBranch,
    selectedCenter,
    selectedGroup = '',
    onBranchChange,
    onCenterChange,
    onGroupChange,
    selectedDate,
    onDateChange,
    dateMode = 'today',
    onDateModeChange
}: CollectionFiltersProps) {

    const branchOptions = branches.map((branch) => ({
        id: branch.id.toString(),
        label: branch.branch_name
    }));

    const centerOptions = centers.map((center) => ({
        id: center.id.toString(),
        label: center.center_name
    }));

    const groupOptions = groups.map((group) => ({
        id: group.id.toString(),
        label: group.group_name
    }));

    // Calculate days for the 'week' mode ending on Sunday (or appropriate week bounds)
    // We'll generate next 7 days or current week remainder
    const weekDays = useMemo(() => {
        const days = [];
        const today = new Date();
        const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday

        // Days remaining in the current week (assuming week ends on Sunday)
        // If today is Wednesday (3), we want Wed, Thu, Fri, Sat, Sun
        const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;

        for (let i = 0; i <= daysUntilSunday; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const dateString = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            days.push({ value: dateString, label: `${dateString} (${dayName})` });
        }
        return days;
    }, []);

    // Effect to enforce constraints when mode changes
    React.useEffect(() => {
        if (dateMode === 'today') {
            const todayStr = new Date().toISOString().split('T')[0];
            if (selectedDate !== todayStr) {
                onDateChange(todayStr);
            }
        } else if (dateMode === 'week') {
            const isValidWeekDay = weekDays.some(d => d.value === selectedDate);
            if (!isValidWeekDay && weekDays.length > 0) {
                onDateChange(weekDays[0].value);
            }
        }
    }, [dateMode, selectedDate, onDateChange, weekDays]);

    return (
        <div className="bg-card rounded-2xl p-5 border border-border-default shadow-sm space-y-4">
            {/* ROW 1: Branch, Center, Group */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <SearchableSelect
                        label="Select Branch *"
                        options={branchOptions}
                        value={selectedBranch}
                        onChange={(val) => onBranchChange(val ? val.toString() : "")}
                        placeholder="Choose a branch"
                        searchPlaceholder="FILTER BRANCH..."
                    />
                </div>
                <div>
                    <SearchableSelect
                        label="Select Center"
                        options={centerOptions}
                        value={selectedCenter}
                        onChange={(val) => onCenterChange(val ? val.toString() : "")}
                        placeholder={!selectedBranch ? "All Centers" : (centers.length === 0 ? "No centers open" : "All Centers")}
                        searchPlaceholder="FILTER CENTER..."
                        disabled={!selectedBranch || centers.length === 0}
                    />
                </div>
                <div>
                    <SearchableSelect
                        label="Select Group"
                        options={groupOptions}
                        value={selectedGroup}
                        onChange={(val) => onGroupChange && onGroupChange(val ? val.toString() : "")}
                        placeholder={!selectedCenter ? "Select Center First" : (groups.length === 0 ? "No groups found" : "All Groups")}
                        searchPlaceholder="FILTER GROUP..."
                        disabled={!selectedCenter || groups.length === 0}
                    />
                </div>
            </div>

            {/* ROW 2: Date Filters */}
            <div className="pt-4 border-t border-border-divider/50 flex flex-col md:flex-row items-end gap-4 max-w-2xl">
                <div className="flex-1 w-full md:max-w-xs">
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 px-1">
                        Filter Mode
                    </label>
                    <div className="relative">
                        <select
                            value={dateMode}
                            onChange={(e) => onDateModeChange && onDateModeChange(e.target.value as DateMode)}
                            className="w-full px-5 py-4 bg-white border-2 rounded-2xl transition-all border-border-default hover:border-border-default/80 focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 text-sm font-black text-text-primary uppercase tracking-wider outline-none appearance-none"
                        >
                            <option value="today">Today</option>
                            <option value="week">Week</option>
                            <option value="all">All</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                    </div>
                </div>

                <div className="flex-[2] w-full">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Collection Date</label>
                        {selectedDate && dateMode !== 'week' && (
                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.1em]">
                                📅 {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}
                            </span>
                        )}
                    </div>

                    {dateMode === 'week' ? (
                        <div className="relative">
                            <select
                                value={selectedDate}
                                onChange={(e) => onDateChange(e.target.value)}
                                className="w-full px-5 py-4 bg-muted-bg/30 border-2 rounded-2xl transition-all border-border-default hover:border-border-default/80 focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 text-sm font-black text-text-primary uppercase tracking-tight outline-none appearance-none cursor-pointer"
                            >
                                {weekDays.map(day => (
                                    <option key={day.value} value={day.value}>
                                        {day.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                        </div>
                    ) : dateMode === 'today' ? (
                        <input
                            type="text"
                            value={`${selectedDate} (${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })})`}
                            disabled
                            className="w-full px-5 py-4 border-2 rounded-2xl transition-all text-sm font-black text-text-primary uppercase tracking-tight outline-none bg-muted-bg/80 border-border-divider/50 cursor-not-allowed opacity-80"
                        />
                    ) : (
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="w-full px-5 py-4 border-2 rounded-2xl transition-all text-sm font-black text-text-primary uppercase tracking-tight outline-none bg-muted-bg/30 border-border-divider/50 hover:border-border-default/80 focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 cursor-pointer text-primary-600"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
