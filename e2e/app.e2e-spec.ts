import { TestangularPage } from './app.po';

describe('testangular App', () => {
  let page: TestangularPage;

  beforeEach(() => {
    page = new TestangularPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
