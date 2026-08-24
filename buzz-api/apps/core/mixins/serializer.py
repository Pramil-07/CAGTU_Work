class DynamicSerializerClassMixin(object):
    serializer_action_classes = {}
    """
    the child class inheriting this mixin should have the variable `serializer_action_classes`
    with the datatype dictionary i.e. {'key': 'value'}
    key => actions (list, retrieve, etc)
    value => serializer class
    """

    def get_serializer_class(self):
        try:
            return self.serializer_action_classes[self.request.method]
        except Exception as e:
            return super().get_serializer_class()


# class DynamicSerializerClassMixin(object):
#
#     serializer_classes: dict
#
#     def get_serializer_class(self):
#         return self.serializer_classes.get(self.request.method, super().get_serializer_class())
#
#
