apple.directive('hierarchy', ['$compile', function ($compile) {
	return {
		restrict: 'E',
		transclude: true,
		scope: {
			node: '=node',
			children: '=children',
			template: '=template',
			roots: '=roots',
			path: '=path',
			functions: '=functions'
		},
		link: function (scope, elem, attrs) {
			scope.maxDepth=3;
			scope.$watch('node', function(newVal, oldVal){
				if(newVal[scope.children].length!=oldVal[scope.children].length)
				{
					elem[0].innerHTML="";
					$compile('<div class="node-content">'+scope.template+'</div>')(scope, function(cloned, scope){
						elem.append(cloned); 
					});
					if(scope.node[scope.children].length>0)
					{
						$compile('<hierarchy functions="functions" roots="node[children]" path="path" node="child" children="children" ng-repeat="(cIndex, child) in node[children]" template="template"></hierarchy>')(scope, function(cloned, scope){
							elem.append(cloned); 
						});
					}
				}
			}, true);
			elem.innerHTML="";
			$compile('<div class="node-content">'+scope.template+'</div>')(scope, function(cloned, scope){
				elem.append(cloned); 
			});
			if(scope.node[scope.children].length>0)
			{
				$compile('<hierarchy functions="functions" roots="node[children]" path="path" node="child" children="children" ng-repeat="(cIndex, child) in node[children]" template="template"></hierarchy>')(scope, function(cloned, scope){
					elem.append(cloned); 
				});
			}
		}
	};
} ]);