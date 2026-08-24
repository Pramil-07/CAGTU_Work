# class DynamicSerializerClassMixin(object):
#     """
#     the parent class should have the variable `serializer_action_classes`
#     with the datatype dictionary i.e. {'key': 'value'}
#     key => actions (list, retrieve, etc)
#     value => serializer class
#     """
#     serializer_action_classes: dict
#     action: str
#
#     def get_serializer_class(self):
#         try:
#             return self.serializer_action_classes[self.action]
#         except (KeyError, AttributeError):
#             return super().get_serializer_class()
