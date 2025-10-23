export class PagedList<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;

    private constructor(items: T[], page: number, pageSize: number, totalItems: number) {
        this.items = items;
        this.page = page;
        this.pageSize = pageSize;
        this.totalItems = totalItems;
        this.hasNextPage = page * pageSize < totalItems;
        this.hasPreviousPage = page > 1 && totalItems > 0;
    }

    static async create<T>(
        queryFn: Promise<T[]>,
        countFn: Promise<number>,
        page: number,
        pageSize: number
    ): Promise<PagedList<T>> {
        const [items, totalItems] = await Promise.all([queryFn, countFn]);
        return new PagedList(items, page, pageSize, totalItems);
    }
}
