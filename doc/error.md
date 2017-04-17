# 错误

在.aspx页面中会出现以下错误：

~~~html
[.CommandBufferContext]GL ERROR :GL_INVALID_FRAMEBUFFER_OPERATION : glClear: framebuffer incomplete
[.CommandBufferContext]GL ERROR :GL_INVALID_FRAMEBUFFER_OPERATION : glDrawArrays: framebuffer incomplete
~~~

错误原因：以下声明造成的，需要删除

~~~html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
~~~

----