from django.db import transaction
from numpy import source
from rest_framework import serializers, status
from stripe import Customer

from apps.activity.models import MerchantRating
from apps.checkoutapp.models import Order
from apps.core.utils import SendThreadMail
from apps.notifications.utils import HookResponse
from ...models import *
from apps.productapp.api.v1.serializers import CustomerDetailSerializer
from django.db.models import Avg, Q
from apps.productapp.models import Product
from apps.productapp.api.v1.serializers import ProductListSerializer
import re
from django.core.exceptions import ObjectDoesNotExist
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils import encoding
from django.contrib.auth import get_user_model
from django.db.models import Q

from ...utils import password_reset_token

User = get_user_model()


class StaffRegistrationSerializer(serializers.ModelSerializer):
    # username = serializers.CharField(allow_null=False)
    # first_name = serializers.CharField(allow_null=False)
    # last_name = serializers.CharField(allow_null=False)
    # email = serializers.EmailField()
    # password = serializers.CharField(allow_null=False)
    confirm_password = serializers.CharField(allow_null=False, write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "confirm_password",
            "phone",
            "profile_image",
            "groups",
        ]
        extra_kwargs = {
            "username": {"required": False},
            "password": {"write_only": True},
        }

    def validate_email(self, data):
        if User.objects.filter(email=data).exclude(email="").exists():
            raise serializers.ValidationError("Account with this email already exists.")
        return data

    def validate_phone(self, data):
        if User.objects.filter(phone=data).exclude(phone="").exists():
            raise serializers.ValidationError(
                "Account with this phone number already exists."
            )
        return data

    # def validate_empty_email(self, data):
    #     if data is None:
    #         raise serializers.ValidationError(
    #             "The email field is empty. Please provide a valid email address."
    #         )
    #     return data

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is not available.")
        if len(value) < 6:
            raise serializers.ValidationError(
                "Username should be at least 6 characters long.."
            )
        return value

    def validate(self, value):
        password1 = value.get("password")
        confirm_password = value.get("confirm_password")
        if password1 != confirm_password:
            raise serializers.ValidationError("Password did not match!")
        reg = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{8,12}$"
        validate = re.search(reg, password1)
        if not validate:
            raise serializers.ValidationError(
                "Your password must be 8-12 characters, and include at least one lowercase letter, one uppercase letter, and a number."
            )
        return value

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        validated_data = {
            **validated_data,
            "is_staff": True,
            "is_verified": True,
            "is_email_verified": True,
            "is_phone_verified": True,
            "mfa_enabled": True,
        }
        user = super().create(validated_data)
        user.set_password(user.password)
        user.save()
        mail_subject = "Buzz Account Created."
        context = {
            "user": user,
            "email": user.email,
            "phone": user.phone,
            "password": validated_data["password"],
            "app_domain": settings.WEB_UI_URL,
            "link": f"{settings.WEB_UI_URL}/settings/account/security",
        }
        user.send_email(
            mail_subject,
            html_message=render_to_string(
                "account/user_create_email.html", context=context
            ),
        )
        return user


class CustomerRegistrationSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(allow_null=False, write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "middle_name",
            "last_name",
            "email",
            "password",
            "confirm_password",
            "phone",
            "profile_image",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    @staticmethod
    def validate_email(data):
        if User.objects.filter(email=data).exists():
            raise serializers.ValidationError("Account with this email already exists.")
        return data

    @staticmethod
    def validate_phone(data):
        if User.objects.filter(phone=data).exists():
            raise serializers.ValidationError(
                "Account with this phone number already exists."
            )
        return data

    @staticmethod
    def validate_empty_email(data):
        if data is None:
            raise serializers.ValidationError(
                "The email field is empty. Please provide a valid email address."
            )
        return data

    @staticmethod
    def validate_username(value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is not available.")
        if len(value) < 6:
            raise serializers.ValidationError(
                "Username should be at least 6 characters long.."
            )
        return value

    @staticmethod
    def validate_password(password):
        reg = (
            r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{8,12}$"
        )
        if validate := re.search(reg, password):
            return password
        else:
            raise serializers.ValidationError(
                "Your password must be 8-12 characters, and include at least one lowercase letter, one uppercase letter, and a number."
            )

    def validate(self, value):
        password1 = value.get("password")
        confirm_password = value.get("confirm_password")
        if password1 != confirm_password:
            raise serializers.ValidationError({"password": ["Password did not match!"]})
        value.pop("confirm_password")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        customer = User(**validated_data, is_active=True, is_customer=True)
        customer.set_password(password)
        customer.save()
        HookResponse.create_hook(username=validated_data["username"])
        domain = settings.WEB_UI_URL
        url = f"http://{domain}"
        if customer.email:
            html_content = render_to_string(
                "verification_mail.html",
                {
                    "domain": url,
                    "email": customer.email,
                    "token": password_reset_token.make_token(customer),
                    "uid": urlsafe_base64_encode(encoding.force_bytes(customer.pk)),
                    "user": customer,
                },
            )
            email_subject = "Activate your account"
            # send_mail(email_subject, html_content, settings.EMAIL_HOST_USER, [email], fail_silently=False)
            # def send_html_mail(self, subject, html_content, recipient_list, sender):
            # SendThreadMail.send_html_mail(self, email_subject, html_content, [customer.email], settings.EMAIL_HOST_USER)
            customer.send_email(email_subject, html_content, settings.DEFAULT_FROM_EMAIL)
        return customer


class MerchantRegistrationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(allow_null=False)
    email = serializers.EmailField()
    password = serializers.CharField(allow_null=False)
    confirm_password = serializers.CharField(allow_null=False)

    class Meta:
        model = Merchant
        fields = [
            "username",
            "name",
            "email",
            "password",
            "confirm_password",
            "phone",
            "logo",
            "shop_code",
            "opening_time",
            "closing_time",
        ]

    def validate_email(self, data):
        if Merchant.objects.filter(user__email=data).exists():
            raise serializers.ValidationError(
                " Merchant Account with this email already exists."
            )
        return data

    def validate_phone(self, data):
        if User.objects.filter(phone=data).exists():
            raise serializers.ValidationError(
                "Account with this phone number already exists."
            )
        return data

    def validate_empty_email(self, data):
        if data is None:
            raise serializers.ValidationError(
                "The email field is empty. Please provide a valid email address."
            )
        return data

    # def validate_username(slef, value):

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is not available.")
        if len(value) < 6:
            raise serializers.ValidationError(
                "Username should be at least 6 characters long.."
            )
        return value

    def validate(self, value):
        password1 = value.get("password")
        confirm_password = value.get("confirm_password")
        if password1 != confirm_password:
            raise serializers.ValidationError("Password did not match!")
        reg = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{8,12}$"
        validate = re.search(reg, password1)
        if not validate:
            raise serializers.ValidationError(
                "Your password must be 8-12 characters, and include at least one lowercase letter, one uppercase letter, and a number."
            )
        return value


class UserLoginSerializer(serializers.Serializer):
    email = serializers.CharField(allow_null=False, required=True)
    password = serializers.CharField(allow_null=False, required=True, write_only=True)

    def validate(self, attrs):
        username = attrs.get("email")
        password = attrs.get("password")

        try:
            user = User.objects.get(
                Q(email=username)
                | Q(username=username)
                | Q(phone=username)
                | Q(phone=f"+{username}")
            )

            if not user.is_verified:
                raise serializers.ValidationError(
                    {
                        "username": [
                            "You're not verified at Buzz. Please check your email or SMS and verify your account."
                        ]
                    }
                )

            if not user.is_active:
                raise serializers.ValidationError(
                    {"username": ["Your account is currently inactive."]}
                )

            if not user.check_password(password):
                raise serializers.ValidationError(
                    "Your username or password is incorrect. Please try again."
                )
            attrs["user"] = user
            return attrs

        except User.DoesNotExist as e:
            raise serializers.ValidationError("Your account doesn't exist.") from e


# start
class UserForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(allow_null=False)

    class Meta:
        fields = ["email"]

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            print("value", value)
            raise serializers.ValidationError(
                "Account with this email doesn't exist. Please try again with valid email address."
            )
        return value


class UserResetPasswordSerializer(serializers.Serializer):
    new_password1 = serializers.CharField(allow_null=False)
    new_password2 = serializers.CharField(allow_null=False)

    class Meta:
        fields = ["new_password1", "new_password2"]

    def validate(self, value):
        password1 = value.get("password")
        confirm_password = value.get("confirm_password")
        if password1 != confirm_password:
            raise serializers.ValidationError("Password did not match!")
        reg = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{8,12}$"
        validate = re.search(reg, password1)
        if not validate:
            raise serializers.ValidationError(
                "Your password must be 8-12 characters, and include at least one lowercase letter, one uppercase letter, and a number."
            )
        return value


class UserPasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(allow_null=False)
    new_password = serializers.CharField(allow_null=False)
    confirm_password = serializers.CharField(allow_null=False)

    class Meta:
        fields = ["old_password", "new_password1", "new_password2"]

    @staticmethod
    def validate_password_length(value):
        if len(value) < getattr(settings, "PASSWORD_MIN_LENGTH", 8):
            raise ValidationError(
                {
                    "detail": "Password should be at least %s characters long."
                    % getattr(settings, "PASSWORD_MIN_LENGTH", 8)
                },
                status.HTTP_400_BAD_REQUEST,
            )
        return value

    def validate_old_password(self, password: str):
        user: User = self.context["request"].user
        if not password:
            return password
        if not user.check_password(password):
            raise ValidationError("The old password you have entered is incorrect")
        return password

    def validate_new_password(self, value):
        self.validate_password_length(value)
        return value

    def validate(self, attrs):
        if attrs.get("social_token"):
            # TODO: after social auth is implemented
            # try:
            #     social_token = attrs['social_token'].split('.')[1]
            #     data = json.loads(urlsafe_b64decode(social_token.encode() + b'==').decode())
            # except (IndexError, UnicodeDecodeError):
            #     raise ValidationError({'social_token': 'Invalid social token.'})
            #
            # attrs['old_password'] = data['jti']
            pass
        else:
            if not attrs.get("old_password"):
                raise ValidationError({"old_password": ["Password cannot be null."]})
            if attrs.get("new_password") != attrs.get("confirm_password"):
                raise ValidationError(
                    {"new_password": ["Password and Confirm password does not match."]}
                )
        if attrs["old_password"] == attrs["new_password"]:
            raise ValidationError(
                {"new_password": ["You have entered the same password as old password"]}
            )
        if attrs.get("social_token"):
            self.context["request"].user.social_only = False
            self.context["request"].user.save()
        return attrs


# ...................OTP..............
class UserForgotPasswordSendOTPSerializer(serializers.Serializer):
    contact_number = serializers.CharField(allow_null=False)

    class Meta:
        fields = ["contact_number"]


class UserResetPasswordOTPSerializer(serializers.Serializer):
    new_password1 = serializers.CharField(allow_null=False)
    new_password2 = serializers.CharField(allow_null=False)

    class Meta:
        fields = ["new_password1", "new_password2"]

    def validate(self, value):
        SpecialSym = ["$", "@", "#", "%", "!", "^", "&", "*"]
        password1 = value.get("new_password1")
        confirm_password = value.get("new_password2")
        if password1 != confirm_password:
            raise serializers.ValidationError("Password did not match!")
        reg = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{8,12}$"
        validate = re.search(reg, password1)
        if not validate:
            raise serializers.ValidationError(
                "Your password must be 8-16 characters, and include at least one lowercase letter, one uppercase letter, and a number."
            )
        return value
        # if len(password1) < 8:
        #     raise serializers.ValidationError(
        #         "The new password must be at least 8 characters long."
        #     )
        # if len(password1) > 12:
        #     raise serializers.ValidationError(
        #         "The new password should not be greater than 12 characters long."
        #     )
        # first_isalpha = password1[0].isalpha()
        # if all(c.isalpha() == first_isalpha for c in password1):
        #     raise serializers.ValidationError(
        #         "The new password must contain at least one letter and at least one digit or punctuation character."
        #     )
        # first_isupper = password1[0].isupper()
        # if all(c.isupper() == first_isupper for c in password1):
        #     raise serializers.ValidationError(
        #         "The new password must contain at least one Uppercase Letter."
        #     )
        # if not any(c in SpecialSym for c in password1):
        #     raise serializers.ValidationError(
        #         "The password must contain at least one Special Symbols."
        #     )


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "created_at",
            "last_login",
            "first_name",
            "last_name",
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    extra_details = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "role",
            "first_name",
            "last_name",
            "extra_details",
        ]

    def get_role(self, obj):
        role = []
        print('role hit')
        if obj.is_superuser:
            role.append("Admin")
        if obj.is_staff:
            role.append("Staff")
        else:
            role.append("Customer")
        return role

    def get_extra_details(self, obj):
        if obj:
            resp = {
                "phone": obj.phone,
                "profile_image": None,

                # "is_superuser": getattr(obj, "is_superuser", False),
            }


            if obj.profile_image and hasattr(obj.profile_image, "url"):
                resp["profile_image"] = self.context["request"].build_absolute_uri(obj.profile_image.url)
            return resp

        if obj:  # TODO will check from Groups General User
            resp = {
                "phone": obj.phone,
                "profile_image": self.context["request"].build_absolute_uri(
                    obj.profile_image.url
                ),
            }
            return resp

    def get_name(self, obj):
        if obj.merchant:
            return obj.merchant.name
        else:
            return obj.first_name


class MerchantListSerializer(serializers.ModelSerializer):
    user = UserListSerializer()
    rating = serializers.SerializerMethodField()

    class Meta:
        model = Merchant
        exclude = [
            "deleted_at",
        ]

    def get_rating(self, obj):
        avg_rating = MerchantRating.objects.filter(merchant_id=obj.id).aggregate(
            Avg("rating")
        )
        total_count = MerchantRating.objects.filter(merchant_id=obj.id).count()
        count = {"count": total_count}
        resp = {}
        resp.update(avg_rating)
        resp.update(count)
        return resp


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        exclude = ["user"]


class AddressUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        exclude = ["user"]
        extra_kwargs = {
            "country": {"required": False},
            "state": {"required": False},
            "city": {"required": False},
            "postal_code": {"required": False},
            "is_default": {"required": False},
            "first_name": {"required": False},
            "last_name": {"required": False},
            "street_address": {"required": False},
            "company_name": {"required": False},
            "contact_number": {"required": False},
        }


class MerchantStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Merchant
        fields = ["status"]


class MerchantRatingListSerializer(serializers.ModelSerializer):
    customer = serializers.SerializerMethodField()

    class Meta:
        model = MerchantRating
        fields = ["customer", "rating", "review", "recommend"]

    def get_customer(self, obj):
        return f"{obj.customer.user.first_name} {obj.customer.user.last_name}"


class MerchantProfileSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    ratings = serializers.SerializerMethodField()

    class Meta:
        model = Merchant
        fields = [
            "id",
            "username",
            "name",
            "phone",
            "logo",
            "created_at",
            "email",
            "followers_count",
            "ratings",
        ]

    def get_username(self, obj):
        return obj.user.username

    def get_email(self, obj):
        return obj.user.email

    def get_followers_count(self, obj):
        try:
            followers = Follow.objects.get(merchant=obj)
            return followers.followers_count()
        except Exception as e:
            return 0

    def get_ratings(self, obj):
        ratings = MerchantRating.objects.filter(merchant=obj)
        return MerchantRatingListSerializer(
            ratings, many=True, context={"request": self.context["request"]}
        ).data


class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "street_address",
            "postal_code",
            "city",
            "state",
            "country",
        ]


class CustomerProfileSerializer(serializers.ModelSerializer):
    address = serializers.SerializerMethodField()
    is_profile_complete = serializers.SerializerMethodField()
    profile_complete_percentage = serializers.SerializerMethodField()
    total_order = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            "id",
        ]

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "phone",
            "profile_image",
            "created_at",
            "email",
            "address",
            "is_profile_complete",
            "profile_complete_percentage",
            "total_order",
            "role",
        ]

    def get_role(self, obj):
        role = []
        if obj.is_superuser:
            role.append("Admin")
        if obj.is_staff:
            role.append("Staff")
        else:
            role.append("Customer")
        return role

    def get_total_order(self, obj):
        return Order.objects.filter(user=obj).count()

    def get_address(self, obj):
        address_obj = Address.objects.filter(user=obj)
        return CustomerAddressSerializer(address_obj, many=True).data

    def get_is_profile_complete(self, obj):
        required_fields = [obj.first_name, obj.last_name, obj.email , obj.profile_image]
        return all(field and str(field).strip() for field in required_fields)

    def get_profile_complete_percentage(self, obj):
        profile_fields = [
            obj.first_name,
            obj.last_name,
            obj.email,
            obj.phone,
            obj.profile_image,
        ]
        total_fields = len(profile_fields)
        filled_fields = sum(
            1 for field in profile_fields if field and str(field).strip()
        )

        # Calculate percentage
        percentage = (
            int((filled_fields / total_fields) * 100) if total_fields > 0 else 0
        )
        return percentage


class CustomerProfileUpdateSerializer(serializers.ModelSerializer):

    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "phone",
            "profile_image",
        ]
        extra_kwargs = {
            "phone": {"required": False},
            "profile_image": {"required": False},
        }


class UserProfileUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone"]
        extra_kwargs = {
            "first_name": {"required": False},
            "last_name": {"required": False},
        }


class StaffProfileSerializer(serializers.ModelSerializer):
    # username = serializers.SerializerMethodField()
    # first_name = serializers.SerializerMethodField()
    # last_name = serializers.SerializerMethodField()
    # email = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "phone",
            "profile_image",
            "created_at",
            "email",
        ]

    # def get_username(self, obj):
    #     return obj.user.username
    #
    # def get_first_name(self, obj):
    #     return obj.user.first_name
    #
    # def get_last_name(self, obj):
    #     return obj.user.last_name
    #
    # def get_email(self, obj):
    #     return obj.user.email


class StaffMyProfileRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "phone",
            "profile_image",
            "created_at",
            "email",
        ]


class StaffMyProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "username",
            "first_name",
            "middle_name",
            "last_name",
            "profile_image",
        )


class CustomerListSerializer(serializers.ModelSerializer):
    # user = UserListSerializer()

    class Meta:
        model = User
        exclude = [
            "password",
            "last_login",
            "is_superuser",
            "user_permissions",
            "groups",
        ]


class CustomerStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id"]
        # fields = ['status']


class StaffListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "created_at",
            "last_login",
            "first_name",
            "last_name",
            "groups",
        ]


class StaffRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "created_at",
            "first_name",
            "middle_name",
            "last_name",
            "groups",
            "is_active",
            "is_phone_verified",
            "is_email_verified",
            "is_verified",
            "is_customer",
        ]


class StaffUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "phone",
            "first_name",
            "middle_name",
            "last_name",
            "groups",
            "is_active",
            "is_phone_verified",
            "is_email_verified",
            "is_verified",
            "is_customer",
        ]


class StaffStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id"]
        # fields = ['status']


class StaffLoginSerializer(serializers.Serializer):
    username = serializers.CharField(allow_null=False)
    password = serializers.CharField(allow_null=False, write_only=True)

    @transaction.atomic
    def create(self, validated_data):
        username = validated_data["username"]
        try:
            user = User.objects.get(
                Q(is_staff=True) & Q(email=username)
                | Q(username=username)
                | Q(phone=username)
                | Q(phone=f"+{username}")
            )
        except User.DoesNotExist as e:
            raise serializers.ValidationError(
                {"username": ["No active user exists with provided credentials"]}
            )
        if not user.check_password(validated_data["password"]):
            raise serializers.ValidationError(
                {"password": "Credentials does not match. Please try again"}
            )
        return user


class MerchantLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(allow_null=False)
    password = serializers.CharField(allow_null=False)


class SendMailToMerchantSerializer(serializers.Serializer):
    email = serializers.EmailField(allow_null=False)


class StaffProfileUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone", "profile_image"]
        extra_kwargs = {
            "phone": {"required": False},
            "profile_image": {"required": False},
        }


class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["phone", "profile_image"]


class MerchantProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Merchant
        fields = ["phone", "logo"]
        extra_kwargs = {"phone": {"required": False}, "logo": {"required": False}}


# class MerchantRatingListSerializer(serializers.ModelSerializer):
#     user=CustomerDetailSerializer()
#     class Meta:
#         model=Merchant_Rating
#         exclude=['product','deleted_at','status']


class MerchantStaffRegistrationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(allow_null=False)
    email = serializers.EmailField()
    password = serializers.CharField(allow_null=False)
    confirm_password = serializers.CharField(allow_null=False)

    class Meta:
        model = Employee
        fields = ["username", "email", "password", "confirm_password"]

    def validate_email(self, data):
        if Employee.objects.filter(user__email=data).exists():
            raise serializers.ValidationError(
                " MerchantStaff Account with this email already exists."
            )
        if Merchant.objects.filter(user__email=data).exists():
            raise serializers.ValidationError(
                "This account is already registered as a Merchant."
            )
        return data

    def validate_phone(self, data):
        if User.objects.filter(phone=data).exists():
            raise serializers.ValidationError(
                "Account with this phone number already exists."
            )
        return data

    def validate_empty_email(self, data):
        if data is None:
            raise serializers.ValidationError(
                "The email field is empty. Please provide a valid email address."
            )
        return data

    # def validate_username(slef, value):

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is not available.")
        if len(value) < 6:
            raise serializers.ValidationError(
                "Username should be at least 6 characters long.."
            )
        return value

    def validate(self, value):
        SpecialSym = ["$", "@", "#", "%", "!", "^", "&", "*"]
        password1 = value.get("password")
        confirm_password = value.get("confirm_password")
        if password1 != confirm_password:
            raise serializers.ValidationError("Password did not match!")
        if len(password1) < 8:
            raise serializers.ValidationError(
                "The password must be at least 8 characters long."
            )
        if len(password1) > 12:
            raise serializers.ValidationError(
                "The password should not be greater than 12 characters long."
            )
        first_isalpha = password1[0].isalpha()
        if all(c.isalpha() == first_isalpha for c in password1):
            raise serializers.ValidationError(
                "The password must contain at least one letter and at least one digit or punctuation character."
            )
        first_isupper = password1[0].isupper()
        if all(c.isupper() == first_isupper for c in password1):
            raise serializers.ValidationError(
                "The password must contain at least one Uppercase Letter."
            )
        if not any(c in SpecialSym for c in password1):
            raise serializers.ValidationError(
                "The password must contain at least one Special Symbol."
            )
        return value


class ClientMerchantProfileSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    products = serializers.SerializerMethodField()

    class Meta:
        model = Merchant
        fields = [
            "id",
            "username",
            "name",
            "phone",
            "logo",
            "created_at",
            "email",
            "followers_count",
            "rating",
            "products",
        ]

    def get_username(self, obj):
        return obj.user.username

    def get_email(self, obj):
        return obj.user.email

    def get_followers_count(self, obj):
        try:
            followers = Follow.objects.get(merchant=obj)
            return followers.followers_count()
        except Exception as e:
            return 0

    def get_rating(self, obj):
        avg_rating = MerchantRating.objects.filter(merchant=obj).aggregate(
            Avg("rating")
        )
        total_count = MerchantRating.objects.filter(merchant=obj).count()

        count = {"count": total_count}
        resp = {}
        resp.update(avg_rating)
        resp.update(count)
        return resp

    def get_products(self, obj):
        products = Product.all_products.filter(user=obj.user)
        return ProductListSerializer(
            products, many=True, context={"request": self.context["request"]}
        ).data
