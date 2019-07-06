apple.directive('hierarchy', ['$compile', function ($compile) {
	return {
		restrict: 'E',
		transclude: true,
		scope: {
			node: '=node',
			children: '=children',
			template: '=template',
			collapseBy: '=collapseBy',
			data: '=data',
			functions: '=functions'
		},
		link: function (scope, elem, attrs) {
			scope.$watch('data', function(newVal, oldVal) {
			}, true);
			$compile('<div class="node-content">'+scope.template+'</div>')(scope, function(cloned, scope){
					elem.append(cloned); 
				});
			if(scope.node[scope.children].length>0)
			{
				$compile('<div class="hierarchy-level"><hierarchy '+(scope.collapseBy?'ng-show="node[collapseBy]"':'')+' collapse-by="collapseBy" functions="functions" data="data" node="child" children="children" ng-repeat="child in node[children]" template="template"></hierarchy></div>')(scope, function(cloned, scope){
					elem.append(cloned); 
				});
			}

			scope.showSelectIcon = function(data, node, children) {
				if (node[children].length === 0) {
					if (data.selectedSubjects.indexOf(node.subjectid) !==-1){
						return 'selected';
					}
					return 'selectable';
				}
				var numCountLeaf=countLeaf(node, children);
				var numCountSelectedLeaf=countSelectedLeaf(data, node, children);
		
				if (numCountSelectedLeaf===0){
					return 'selectable';
				}
				else if (numCountLeaf===numCountSelectedLeaf){
					return 'selected';
				}
				return 'semiSelected';
			}

			function countLeaf(node, children) {
				if (node[children].length === 0) {
					return 1;
				}
		
				var count = 0;
				for (var i = 0; i < node[children].length; i++) {
					 count +=  countLeaf(node[children][i], children);
				}
				return count;
			}
		
			function countSelectedLeaf(data, node, children) {
				
		
				if (node[children].length === 0 && data.selectedSubjects.indexOf(node.subjectid) !==-1){
					return 1;
				}
				if (node[children].length === 0 && data.selectedSubjects.indexOf(node.subjectid) ==-1){
					return 0;
				}
				var count = 0;
				for (var i = 0; i < node[children].length; i++) {	
					 count +=  countSelectedLeaf(data, node[children][i], children);
		
				}
				return count;
			}
		}
	};
} ]);