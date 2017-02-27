import { MakerPlayGroundPage } from './app.po';

describe('upgrade-project App', () => {
  let page: MakerPlayGroundPage;

  beforeEach(() => {
    page = new MakerPlayGroundPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
