describe('simple example', function() {
  it('just works', function() {
    fakeAjax({urls: {'/simple': {successData: 'y'}}})
    var result = 'x'
    $.get('/simple', function(data) {
      result = data
    })
    expect(result).toEqual('y')
  })
})

// Fake AJAX with DOM, single AJAX call. Response test data is loaded using .loadTestData.

describe('showing questions', function() {
  beforeEach(function() {
    setFixtures('<button class="showQuestions"/><div class="questions"></div>')
    sut.setupQuestionsBehavior()
  })

  describe('succeeds', function() {
    beforeEach(function() {
      fakeAjax({urls: {'/questions/list': {successData: loadTestData('.questions', 'fake-ajax-fixture.html')}}})
      $('.showQuestions').click()
    })

    it('shows the list of questions fetched from server', function() {
      expect($('.question').length).toEqual(3)
      expect($('.question').last()).toHaveText('Question 3')
    })
  })

  describe('fails', function() {
    beforeEach(function() {
      fakeAjax({urls: {'/questions/list': {errorMessage: 'Failed loading questions.'}}})
      $('.showQuestions').click()
    })

    it('shows error message from server', function() {
      expect($('.questions')).toHaveText('Failed loading questions.')
    })
  })
})

// Fake AJAX without DOM.

describe('.countResponseLength', function() {
  describe('succeeds', function() {
    beforeEach(function() {
      fakeAjax({urls: {'/succeeds': {successData: 'Jasmine FTW!'}}})
    })

    it('counts response length', function() {
      expect(sut.countResponseLength({url: '/succeeds'})).toEqual(12)
    })
  })

  describe('fails', function() {
    beforeEach(function() {
      fakeAjax({urls: {'/fails': {errorMessage: 'argh'}}})
    })

    it('yields given default value', function() {
      expect(sut.countResponseLength({url: '/fails', defaultOnError: 666})).toEqual(666)
    })

    it('executes given error handler', function() {
      var errorMessage
      function errorHandler(xhr) {
        errorMessage = xhr.responseText
      }
      sut.countResponseLength({url: '/fails', errorHandler: errorHandler})
      expect(errorMessage).toEqual('argh')
    })
  })
})

// Multiple related AJAX calls, some succeed, some fail.

describe('clicking question', function() {
  describe('author is not available', function() {
    beforeEach(function() {
      setFixtures('<ul class="questions"><li id="question1">q1</li><li id="question2">q2</li></ul><div class="answerContainer"></div>')
      sut.setupAnswersBehavior()
      fakeAjax({
        urls: {
          '/answers/get?questionId=question2': {successData: loadTestData('.answer2', 'fake-ajax-fixture.html')},
          '/authors/get?answerId=answer2': {errorMessage: 'author data not available'},
          '/onError': {successData: 'Please try again later.'}
        }
      })
      $('.questions li').last().click()
    })

    it('shows answer', function() {
      expect($('.answer')).toHaveText('Answer 2')
    })

    it('shows error message instead of author details', function() {
      expect($('.author')).toHaveText('Please try again later.')
    })
  })
})

describe('when checking what is sent to the server', function() {
  beforeEach(function() {
    sut.setupMultipleAjaxCalls()
  })

  it('sends expected data', function() {
    expect(latestAjaxWithUrlMatching('first').data).toEqual({'param1': 'value1', 'param2': 'value2'})
    expect(latestAjax().url).toEqual('/third')
  })

  it('decodes url to enhance readability of values', function() {
    expect(latestAjaxWithUrlMatching('second').url).toContain('+<foo>+"bar+&?#')
  })
})

// When response is expected to be in JSON format ($.getJSON is called in SUT).

describe('showing user info', function() {
  beforeEach(function() {
    setFixtures('<button class="showUser"/><div class="user"><div class="name"></div><div class="age"></div></div>')
    sut.setupUserBehavior()
    fakeAjax({urls: {'/user': {successData: {name: 'John', age: 30}}}})
    $('.showUser').click()
  })

  it('shows name', function() {
    expect($('.user .name')).toHaveText('John')
  })

  it('shows age', function() {
    expect($('.user .age')).toHaveText('30')
  })
})

describe('after each spec', function() {
  it('context is cleared', function() {
    expect(jasmine.FakeAjax.urls).toBeFalsy()
  })
})

describe('supported callbacks', function() {
  var beforeSendWasCalled = false
  var successWasCalled = false
  var completeWasCalled = false

  beforeEach(function() {
    fakeAjax({urls: {'/example': {successData: 'yay'}}})
    $.ajax({
      url: '/example',
      beforeSend: function() {
        beforeSendWasCalled = true
      },
      success: function() {
        successWasCalled = true
      },
      complete: function() {
        completeWasCalled = true
      }
    })
  })

  it('.beforeSend', function() {
    expect(beforeSendWasCalled).toBeTruthy()
  })

  it('.success', function() {
    expect(successWasCalled).toBeTruthy()
  })

  it('.complete', function() {
    expect(completeWasCalled).toBeTruthy()
  })
})

describe( "REST", function() {
  var con, res,
  successWasCalled, completeWasCalled,
  rest_type,
  fix = { urls : { 'post /test' : { successData : { rest_type : "post" } },
				   'put /test'  : { successData : { rest_type : "put" } },
				   '/test'  : { successData : { rest_type : "get" } },
				   'delete /test'  : { successData : { rest_type : "delete" }}}};

  beforeEach(function() {
    rest_type = '';
    successWasCalled = false;
    completeWasCalled = false;

    con = { type: 'POST',
			url: '/test',
			success : function(data) {
		      rest_type = data.rest_type;
		      successWasCalled = true;
			},
			complete : function(data) {
		      completeWasCalled = true;
			} };
    fakeAjax(fix);
  });

  it( "post", function() {
    $.ajax(con);
    expect(rest_type).toBe("post");
  });
  it( "get", function() {
	con.type = 'get';
	$.ajax(con);
	expect(rest_type).toBe("get");
  });
  it( "put", function() {
	con.type = 'put';
	$.ajax(con);
	expect(rest_type).toBe("put");
  });
  it( "delete", function() {
	con.type = 'delete';
	$.ajax(con);
	expect(rest_type).toBe("delete");
  });
});describe('simple example', function() {
  it('just works', function() {
    fakeAjax({urls: {'/simple': {successData: 'y'}}})
    var result = 'x'
    $.get('/simple', function(data) {
      result = data
    })
    expect(result).toEqual('y')
  })
})

// Fake AJAX with DOM, single AJAX call. Response test data is loaded using .loadTestData.

describe('showing questions', function() {
  beforeEach(function() {
    setFixtures('<button class="showQuestions"/><div class="questions"></div>')
    sut.setupQuestionsBehavior()
  })

  describe('succeeds', function() {
    beforeEach(function() {
      fakeAjax({urls: {'/questions/list': {successData: loadTestData('.questions', 'fake-ajax-fixture.html')}}})
      $('.showQuestions').click()
    })

    it('shows the list of questions fetched from server', function() {
      expect($('.question').length).toEqual(3)
      expect($('.question').last()).toHaveText('Question 3')
    })
  })

  describe('fails', function() {
    beforeEach(function() {
      fakeAjax({urls: {'/questions/list': {errorMessage: 'Failed loading questions.'}}})
      $('.showQuestions').click()
    })

    it('shows error message from server', function() {
      expect($('.questions')).toHaveText('Failed loading questions.')
    })
  })
})

// Fake AJAX without DOM.

describe('.countResponseLength', function() {
  describe('succeeds', function() {
    beforeEach(function() {
      fakeAjax({urls: {'/succeeds': {successData: 'Jasmine FTW!'}}})
    })

    it('counts response length', function() {
      expect(sut.countResponseLength({url: '/succeeds'})).toEqual(12)
    })
  })

  describe('fails', function() {
    beforeEach(function() {
      fakeAjax({urls: {'/fails': {errorMessage: 'argh'}}})
    })

    it('yields given default value', function() {
      expect(sut.countResponseLength({url: '/fails', defaultOnError: 666})).toEqual(666)
    })

    it('executes given error handler', function() {
      var errorMessage
      function errorHandler(xhr) {
        errorMessage = xhr.responseText
      }
      sut.countResponseLength({url: '/fails', errorHandler: errorHandler})
      expect(errorMessage).toEqual('argh')
    })
  })
})

// Multiple related AJAX calls, some succeed, some fail.

describe('clicking question', function() {
  describe('author is not available', function() {
    beforeEach(function() {
      setFixtures('<ul class="questions"><li id="question1">q1</li><li id="question2">q2</li></ul><div class="answerContainer"></div>')
      sut.setupAnswersBehavior()
      fakeAjax({
        urls: {
          '/answers/get?questionId=question2': {successData: loadTestData('.answer2', 'fake-ajax-fixture.html')},
          '/authors/get?answerId=answer2': {errorMessage: 'author data not available'},
          '/onError': {successData: 'Please try again later.'}
        }
      })
      $('.questions li').last().click()
    })

    it('shows answer', function() {
      expect($('.answer')).toHaveText('Answer 2')
    })

    it('shows error message instead of author details', function() {
      expect($('.author')).toHaveText('Please try again later.')
    })
  })
})

describe('when checking what is sent to the server', function() {
  beforeEach(function() {
    sut.setupMultipleAjaxCalls()
  })

  it('sends expected data', function() {
    expect(latestAjaxWithUrlMatching('first').data).toEqual({'param1': 'value1', 'param2': 'value2'})
    expect(latestAjax().url).toEqual('/third')
  })

  it('decodes url to enhance readability of values', function() {
    expect(latestAjaxWithUrlMatching('second').url).toContain('+<foo>+"bar+&?#')
  })
})

// When response is expected to be in JSON format ($.getJSON is called in SUT).

describe('showing user info', function() {
  beforeEach(function() {
    setFixtures('<button class="showUser"/><div class="user"><div class="name"></div><div class="age"></div></div>')
    sut.setupUserBehavior()
    fakeAjax({urls: {'/user': {successData: {name: 'John', age: 30}}}})
    $('.showUser').click()
  })

  it('shows name', function() {
    expect($('.user .name')).toHaveText('John')
  })

  it('shows age', function() {
    expect($('.user .age')).toHaveText('30')
  })
})

describe('after each spec', function() {
  it('context is cleared', function() {
    expect(jasmine.FakeAjax.urls).toBeFalsy()
  })
})

describe('supported callbacks', function() {
  var beforeSendWasCalled = false
  var successWasCalled = false
  var completeWasCalled = false

  beforeEach(function() {
    fakeAjax({urls: {'/example': {successData: 'yay'}}})
    $.ajax({
      url: '/example',
      beforeSend: function() {
        beforeSendWasCalled = true
      },
      success: function() {
        successWasCalled = true
      },
      complete: function() {
        completeWasCalled = true
      }
    })
  })

  it('.beforeSend', function() {
    expect(beforeSendWasCalled).toBeTruthy()
  })

  it('.success', function() {
    expect(successWasCalled).toBeTruthy()
  })

  it('.complete', function() {
    expect(completeWasCalled).toBeTruthy()
  })
})


// Context Specs
describe( "Context", function() {
  var some_obj, con

  beforeEach(function() {
	some_obj = {
	  context_data : "I'm the context",
	  onSuccess : function(data, ts, xhr) {
		expect(this.context_data).toBe("I'm the context");
	  },
	  onError : function(xhr, data) {
		expect(this.context_data).toBe("I'm the context");
	  },
	  onComplete : function( xhr, ts ) {
		expect(this.context_data).toBe("I'm the context");
	  }
	}
	con =  { url : '/test',
			 method : 'get',
			 context : some_obj,
			 success : some_obj.onSuccess,
			 complete : some_obj.onComplete,
			 error : some_obj.onError
		   }

  })
  describe( "Success", function() {
	beforeEach(function() {
	  fakeAjax( { urls : { '/test' : { successData : 'hi' } } } )
	})
	it( "With context", function() {
	  $.ajax( con );
	})
	it( "Without context", function() {
	  delete con['context']
	  con.complete = con.success = function() {
		expect( this.context_data ).not.toBeDefined()
	  }
	  $.ajax( con );
	})
  })
  describe( "Error", function() {
	beforeEach(function() {
	  fakeAjax( { urls : { '/test' : { errorMessage : 'hi' } } } )
	})
	it( "With context", function() {
	  $.ajax( con );
	})
	it( "Without context", function() {
	  delete con['context']
	  con.complete = con.error = function() {
		expect( this.context_data ).not.toBeDefined()
	  }
	  $.ajax( con );
	})
  })
})

// Using Method for REST applications

describe( "REST", function() {
  var con, res,
  successWasCalled, completeWasCalled, errorWasCalled,
  rest_type, ret_xhr;
  fix = { urls : { 'post /test' : { successData : { rest_type : "post" } },
				   'put /test'  : { successData : { rest_type : "put" } },
				   '/test'  : { successData : { rest_type : "get" },
								xhr : { status : 201 } },
				   'delete /test'  : { successData : { rest_type : "delete" }},
				   'post /error' : { xhr : { status : 501 } },
				   'put /error'  : { xhr : { status : 502 } },
				   '/error'  : { errorMessage : "Error from get" },
				   'delete /error'  : { xhr : { responseText : "Error from delete" }}}};

  beforeEach(function() {
    rest_type = '';
    successWasCalled = false;
    completeWasCalled = false;
	errorWasCalled = false;

    con = { type: 'POST',
			url: '/test',
			success : function(data, ts, xhr ) {
		      rest_type = data.rest_type
		      successWasCalled = true
			},
			complete : function( xhr, ts ) {
		      completeWasCalled = true
			  ret_xhr =  xhr;
			},
			error : function( xhr, ts ) {
			  errorWasCalled = true; }
		  };
    fakeAjax(fix);
  });

  describe( "Success", function() {
	beforeEach(function() {
	  con.url =  '/test'
	})
	it( "post", function() {
      $.ajax(con)
      expect(rest_type).toBe("post")
	  expect( ret_xhr.status ).toBe( 200 )
	})
	it( "get", function() {
	  con.type = 'get'
	  $.ajax(con)
	  expect(rest_type).toBe("get")
	  expect( ret_xhr.status ).toBe( 201 )
	})
	it( "put", function() {
	  con.type = 'put'
	  $.ajax(con)
	  expect(rest_type).toBe("put")
	  expect( ret_xhr.status ).toBe( 200 )
	})
	it( "delete", function() {
	  con.type = 'delete'
	  $.ajax(con)
	  expect(rest_type).toBe("delete")
	  expect( ret_xhr.status ).toBe( 200 )
	})
  })
  describe( "Error", function() {
	beforeEach(function() {
	  con.url = '/error'
	})
	afterEach(function() {
      expect(errorWasCalled).toBeTruthy()
	  expect(successWasCalled).toBeFalsy()
	})
	it( "post", function() {
      $.ajax(con);
	  expect( ret_xhr.status ).toBe( 501 );
	});
	it( "get", function() {
	  con.type = 'get'
	  $.ajax(con)
	  expect( ret_xhr.status ).toBe( 500 );
	});
	it( "put", function() {
	  con.type = 'put'
	  $.ajax(con)
	  expect( ret_xhr.status ).toBe( 502 )
	});
	it( "delete", function() {
	  con.type = 'delete'
	  $.ajax(con)
	  expect( ret_xhr.status ).toBe( 500 )
	});
  })
});