import Vue from 'vue';
import MockAdapter from 'axios-mock-adapter';
import axios from '~/lib/utils/axios_utils';
import epicShowApp from 'ee/epics/epic_show/components/epic_show_app.vue';
import epicHeader from 'ee/epics/epic_show/components/epic_header.vue';
import issuableApp from '~/issue_show/components/app.vue';
import issuableAppEventHub from '~/issue_show/event_hub';
import mountComponent from 'spec/helpers/vue_mount_component_helper';
import issueShowData from 'spec/issue_show/mock_data';
import { props } from '../mock_data';

describe('EpicShowApp', () => {
  let mock;
  let vm;
  let headerVm;
  let issuableAppVm;

  beforeEach((done) => {
    mock = new MockAdapter(axios);
    mock.onGet('/realtime_changes').reply(200, issueShowData.initialRequest);
    mock.onAny().reply(404, null);

    const {
      canUpdate,
      canDestroy,
      endpoint,
      updateEndpoint,
      initialTitleHtml,
      initialTitleText,
      markdownPreviewPath,
      markdownDocsPath,
      author,
      created,
      toggleSubscriptionPath,
    } = props;

    const EpicShowApp = Vue.extend(epicShowApp);
    vm = mountComponent(EpicShowApp, props);

    const EpicHeader = Vue.extend(epicHeader);
    headerVm = mountComponent(EpicHeader, {
      author,
      created,
      canDelete: canDestroy,
    });

    const IssuableApp = Vue.extend(issuableApp);
    issuableAppVm = mountComponent(IssuableApp, {
      canUpdate,
      canDestroy,
      endpoint,
      updateEndpoint,
      issuableRef: '',
      initialTitleHtml,
      initialTitleText,
      initialDescriptionHtml: '',
      initialDescriptionText: '',
      markdownPreviewPath,
      markdownDocsPath,
      projectPath: props.groupPath,
      projectNamespace: '',
      showInlineEditButton: true,
      toggleSubscriptionPath,
    });

    setTimeout(done);
  });

  afterEach(() => {
    mock.restore();
  });

  it('should render epic-header', () => {
    expect(vm.$el.innerHTML.indexOf(headerVm.$el.innerHTML) !== -1).toEqual(true);
  });

  it('should render issuable-app', () => {
    expect(vm.$el.innerHTML.indexOf(issuableAppVm.$el.innerHTML) !== -1).toEqual(true);
  });

  it('should render epic-sidebar', () => {
    expect(vm.$el.querySelector('aside.right-sidebar.epic-sidebar')).not.toBe(null);
  });

  it('should emit delete.issuable when epic is deleted', () => {
    const deleteIssuable = jasmine.createSpy();
    issuableAppEventHub.$on('delete.issuable', deleteIssuable);
    spyOn(window, 'confirm').and.returnValue(true);
    spyOnDependency(issuableApp, 'visitUrl');

    vm.$el.querySelector('.detail-page-header .btn-remove').click();
    expect(deleteIssuable).toHaveBeenCalled();
  });
});
