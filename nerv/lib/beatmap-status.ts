export enum RankedStatus {
	Inactive = -3,
	NotSubmitted = -1,
	Pending = 0,
	UpdateAvailable = 1,
	Ranked = 2,
	Approved = 3,
	Qualified = 4,
	Loved = 5
}

export const statusIntToString = (statusInt: number): string => {
	switch (statusInt) {
		case RankedStatus.Loved:
			return 'Loved';
		case RankedStatus.Qualified:
			return 'Qualified';
		case RankedStatus.Approved:
			return 'Approved';
		case RankedStatus.Ranked:
			return 'Ranked';
		case RankedStatus.Pending:
			return 'Pending';
		case RankedStatus.NotSubmitted:
			return 'WIP';
		case RankedStatus.Inactive:
			return 'Graveyard';
		default:
			return 'Pending';
	}
};

export const statusStringToId = (statusString: string): RankedStatus => {
	const normalized = statusString.toLowerCase().trim();
	switch (normalized) {
		case 'inactive':
			return RankedStatus.Inactive;
		case 'notsubmitted':
		case 'wip':
			return RankedStatus.NotSubmitted;
		case 'pending':
			return RankedStatus.Pending;
		case 'updateavailable':
			return RankedStatus.UpdateAvailable;
		case 'ranked':
			return RankedStatus.Ranked;
		case 'approved':
			return RankedStatus.Approved;
		case 'qualified':
			return RankedStatus.Qualified;
		case 'loved':
			return RankedStatus.Loved;
		default:
			return RankedStatus.Pending;
	}
};
