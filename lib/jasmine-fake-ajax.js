(function($, jasmine) {
  var default_xhr = { readyState : 4,
					  status : 200,
					  statusText : 'OK ' },
  default_xhr_error = { readyState : 4,
						status : 500,
						statusText : 'Internal Server Error' }

  function _initContext(options) {
    this.urls = options.urls
    this.recordedSession = new RecordedSession()
  }

  function _loadTestData(selector, url) {
    var fixture
    jasmine.FakeAjax.realAjax({
      url: url,
      async: false,
      success: function(data) {
        fixture = data
      },
      error: function() {
        logAndThrow("Failed loading test data by url '" + url + "'.")
      }
    })
    var testDataContainer = $(fixture).find(selector)
    if (testDataContainer.length > 0) {
      return testDataContainer.html()
    } else {
      logAndThrow("Failed loading test data by selector '" + selector + "' from url '" + url + "'. Whole fixture: " + fixture)
      return null // to get rid of IDE warning, this line is unreachable
    }
  }

  function _latestAjax() {
    var ajaxCalls = jasmine.FakeAjax.recordedSession.ajaxCalls
    if (ajaxCalls.length === 0) {
      logAndThrow("Ajax hasn't yet been called in spec '" + jasmine.getEnv().currentSpec.description + "'.")
      return null // to get rid of IDE warning, this line is unreachable
    } else {
      return lastWithUrlDecoded(ajaxCalls)
    }
  }

  function _latestAjaxWithUrlMatching(partialUrl) {
    var matchingAjaxCalls = $(jasmine.FakeAjax.recordedSession.ajaxCalls).filter(function(index, ajaxOptions) {
      return ajaxOptions.url.match(partialUrl)
    })
    if (matchingAjaxCalls.length === 0) {
      logAndThrow("Matching url was not found by partial url '" + partialUrl + "' in spec '" + jasmine.getEnv().currentSpec.description + "'.")
      return null // to get rid of IDE warning, this line is unreachable
    } else {
      return lastWithUrlDecoded(matchingAjaxCalls)
    }
  }

  function lastWithUrlDecoded(ajaxOptions) {
    var last = ajaxOptions[ajaxOptions.length - 1]
    last.url = $.URLDecode(last.url)
    return last
  }

  function logAndThrow(errorMessage) {
    jasmine.FakeAjax.log.error(errorMessage)
    throw errorMessage
  }

  function RecordedSession() {
    this.ajaxCalls = []

    this.addAjaxCall = function(ajaxOptions) {
      this.ajaxCalls.push(ajaxOptions)
    }
  }

  function Logger() {
    this.error = function(message) {
      withFirebugConsole(function(c) {
        c.error(message)
        debugger
      })
    }

    this.warn = function(message) {
      withFirebugConsole(function(c) {
        c.warn(message)
      })
    }

    function withFirebugConsole(callback) {
      if (window.console) {
        callback(window.console)
      }
    }
  }

  jasmine.FakeAjax = {
    realAjax: $.ajax,
    initContext: _initContext,
    loadTestData: _loadTestData,
    latestAjax: _latestAjax,
    latestAjaxWithUrlMatching: _latestAjaxWithUrlMatching,
    log: new Logger()
  }

  $.ajax = function(options) {
    jasmine.FakeAjax.recordedSession.addAjaxCall(options)
    if (options.beforeSend) {
      options.beforeSend()
    }
    var urls = jasmine.FakeAjax.urls,
    context = options.context || options,
    go = options.type && options.type.toLowerCase() != "get" ? (options.type.toLowerCase() + " " + options.url) : options.url,
    xhr = {},
    ts = "";

    if (!urls) {
      jasmine.FakeAjax.log.warn("There are no ajax url mappings defined. Actual ajax url was '" + go + "'.")
    } else if (!urls[go]) {
      jasmine.FakeAjax.log.warn("Applying default success data for url '" + go + "' in spec '" + jasmine.getEnv().currentSpec.description + "'.")
      if (!options.success) {
        logAndThrow("Ajax success handler is not defined in system under test for url '" + go + "'. See firebug script stack for more info.")
      } else {
        options.success(context, "default success data",
						ts = 'success', $.extend(xhr, default_xhr ));
      }
    } else {
	  if (urls[go].successData) {
		xhr = $.extend(xhr, default_xhr, urls[go].xhr)
		ts = 'success'
		options.success.call( context, urls[go].successData, ts, xhr );
      } else if (urls[go].xhr || urls[go].errorMessage ) {
		xhr = $.extend(xhr, default_xhr_error, urls[go].xhr)
		if( urls[go].errorMessage ) {
		  xhr.responseText = urls[go].errorMessage
		}
		ts = 'error'
		options.error.call( context, xhr, ts)
      } else {
		logAndThrow("Unknown mapping value for url '" + go + "'. Expected either successData or errorMessage. Actual was '" + urls[go] + "'")
      }
	}
    if (options.complete) {
      options.complete.call( context, xhr, ts )
    }
  }
})(jQuery, jasmine)

function fakeAjax(options) { jasmine.FakeAjax.initContext(options) }
function clearContext() { fakeAjax({}) }
function loadTestData(selector, url) { return jasmine.FakeAjax.loadTestData(selector, url) }
function latestAjax() { return jasmine.FakeAjax.latestAjax() }
function latestAjaxWithUrlMatching(partialUrl) { return jasmine.FakeAjax.latestAjaxWithUrlMatching(partialUrl) }

beforeEach(clearContext)
