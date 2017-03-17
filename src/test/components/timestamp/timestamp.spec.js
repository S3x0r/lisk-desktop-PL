describe('timestamp component', function() {
  var $compile,
      $rootScope,
      element;

  // Load the myApp module, which contains the directive
  beforeEach(angular.mock.module("app"));

  // Store references to $rootScope and $compile
  // so they are available to all tests in this describe block
  beforeEach(inject(function(_$compile_, _$rootScope_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  beforeEach(function() {
    var liskEpoch = Date.UTC(2016, 4, 24, 17, 0, 0, 0);
    $rootScope.currentTimestamp = Math.floor((new Date().valueOf() - liskEpoch) / 1000);

    element = $compile("<timestamp data='currentTimestamp'></timestamp>")($rootScope);
    $rootScope.$digest();
  });

  it('should contain a timeago of the date', function() {
    expect(element.text()).to.equal('a few seconds');
  });

});

