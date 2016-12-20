import { MpWebpackPage } from './app.po';

describe('mp-webpack App', function() {
  let page: MpWebpackPage;

  beforeEach(() => {
    page = new MpWebpackPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
