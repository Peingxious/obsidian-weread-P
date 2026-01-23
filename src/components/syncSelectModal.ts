import { App, SuggestModal, Notice } from 'obsidian';
import { Metadata } from '../models';
import SyncNotebooks from '../syncNotebooks';

export class SyncSelectModal extends SuggestModal<Metadata> {
	private syncNotebooks: SyncNotebooks;
	private metaDataArr: Metadata[] = [];
	private isFetching = false;

	constructor(app: App, syncNotebooks: SyncNotebooks) {
		super(app);
		this.syncNotebooks = syncNotebooks;
		this.setPlaceholder('输入书名或作者进行搜索...');
	}

	async getSuggestions(query: string): Promise<Metadata[]> {
		if (this.metaDataArr.length === 0 && !this.isFetching) {
			this.isFetching = true;
			new Notice('正在获取书籍列表，请稍候...');
			try {
				this.metaDataArr = await this.syncNotebooks.getALlMetadata();
			} catch (e) {
				new Notice('获取书籍列表失败');
				console.error(e);
			} finally {
				this.isFetching = false;
			}
		}

		const lowerCaseQuery = query.toLowerCase();
		return this.metaDataArr.filter((book) =>
			book.title.toLowerCase().includes(lowerCaseQuery) ||
			book.author.toLowerCase().includes(lowerCaseQuery)
		);
	}

	renderSuggestion(book: Metadata, el: HTMLElement) {
		el.createEl('div', { text: `《${book.title}》` });
		const subInfo = book.category ? `${book.author} | ${book.category}` : book.author;
		el.createEl('div', { text: subInfo, attr: { style: 'font-size: 0.6em' } });
	}

	onChooseSuggestion(book: Metadata, evt: MouseEvent | KeyboardEvent) {
		this.syncNotebooks.syncBook(book.bookId);
	}
}
