/**
 * Created by pdc on 2016/6/28.
 */
var tpl='<ul class="ui-tree-ul" ms-for="el in el.children">'+
        '<li>'+
        '<input class="ui-tree-input" type="checkbox" ms-duplex="@checkArray" ms-class="{halfCheck: el.isHalf}" ms-attr="{value:el.id}" ms-on-change="@check($event,el)" ms-if="@showCheck"/>'+
        '<a ms-click="@toggle($event,el)">{{el.name}}'+
        '<small class="glyphicon glyphicon-triangle-right"></small>'+
        '</a>'+
        '<div ms-html="@tpl" ms-if="el.children.length" ms-css="{display:(el.open?&quot;block&quot;:&quot;none&quot;),a:@getParent(el)}"></div>'+
        '</li>'+
        '</ul>';
avalon.component('ms-tree', {
    template:'<div>'+
    '<ul class="ui-tree-ul" ms-for="el in @data">'+
                '<li>'+
                    '<input class="ui-tree-input" type="checkbox" ms-duplex="@checkArray" ms-class="{halfCheck: el.isHalf}" ms-attr="{value:el.id}" ms-on-change="@check($event,el)" ms-if="@showCheck"/>'+
                    '<a ms-click="@toggle($event,el)">{{el.name}}'+
                        '<small class="glyphicon glyphicon-triangle-right"></small>'+
                    '</a>'+
                 '<div ms-html="@tpl" ms-if="el.children.length" ms-css="{display:(el.open?&quot;block&quot;:&quot;none&quot;),a:@getParent(el)}"></div>'+
                '</li>'+
            '</ul>'+
    '</div>',
    defaults: {
        tpl:tpl,
        data:[],
        singleData:null,
        //控制是否显示选者框
        showCheck:true,
        //已选择单选框的值
        checkArray:[],
        checkCb:null,
        //树形单选框的处理，会稍微麻烦些
        check:function(event,el){
            var bool=event.target.checked,
                Array=checkArray.slice(),
                id,
                index;
            var setChild=function(el){
                id=el.id+"";
                index=Array.indexOf(id);
                el.isHalf=false;
                if(bool){
                    index+1||Array.push(id)
                }else{
                    index+1&&Array.splice(index,1)
                }
                if(el.children){
                    avalon.each(el.children,function(i,_el){
                        setChild(_el)
                    })
                }
            }
            setChild(el);
            checkArray.clear();
            checkArray.pushArray(Array);
            var outer=el.getOuter;
            while(outer){
                var $el=null;
                outer(function(_el){
                    $el=_el;
                  var compare=compareArray(_el,checkArray.$model),
                      id=_el.id+"";
                    switch (compare){
                        case 1:
                            _el.isHalf=false;
                            checkArray.ensure(id)
                            break;
                        case 0:
                            _el.isHalf=false;
                            checkArray.remove(id)
                            break;
                        case -1:
                            _el.isHalf=true;
                            checkArray.remove(id);
                            break
                    }
                });
                outer=$el&&$el.getOuter
            }

            this.checkCb&&this.checkCb.call(this,el);
        },
        toggleCb:null,
        //控制显示隐藏
        toggle:function(event,el){
            el.open=!el.open;
            this.toggleCb&&this.toggleCb.call(this,event,el)
        },
        //@getParent为了弥补数据的传递，不太优雅，有从其它方式获取到父级循环的vm对象的话可删
        getParent:function(parent){
            if(parent.children){
                avalon.each(parent.children,function(i,_el){
                    _el.getOuter=function(callBack){callBack.call(this,parent,_el,i)}
                })
            }
        },
        add:function(el){
            var sinData=this.singleData,
                data=avalon.mix({pid:el.id},sinData);
            el.children.push(data)
        }
    },

})
//比较二个数组中的值是否全等  1：相等  -1：有部分相等  0：完全不相等
function compareArray(ar1,ar2){
    var i= 0,len=ar1.children.length;
    avalon.each(ar1.children,function(index,el){
        if(el.isHalf){
            i=len-1;//此处赋的值无多大意义，仅仅只是为了让函数返回结果为-1；
            return false;
        }
        ar2.indexOf(el.id+"")+1&&(i+=1);
    })
    return i==len?1:i>0&&i<len?-1:i;
}
//
